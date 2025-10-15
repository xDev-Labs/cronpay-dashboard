import { NextRequest } from "next/server";
import { jsPDF } from "jspdf";
import autoTable, { CellHookData } from "jspdf-autotable";
import { maskTxHash } from "@/lib/generate-api-key";

type TimePeriod = "today" | "7days" | "30days" | "6months" | "1year";

interface Transaction {
  id: string;
  amount: string;
  currency: string;
  token_received_amount: string | null;
  status: "completed" | "pending" | "failed";
  transaction_hash: string | null;
  created_at: string;
  config_keys?: {
    id: string;
    chain: string | number;
    token: string;
  } | null;
}

function getPeriodLabel(period: TimePeriod): string {
  const labels = {
    today: "Today",
    "7days": "Last 7 Days",
    "30days": "Last 30 Days",
    "6months": "Last 6 Months",
    "1year": "Last Year",
  };
  return labels[period] || period;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      period,
      transactions,
      user,
    }: {
      period: TimePeriod;
      transactions: Transaction[];
      user: string;
    } = body;

    if (!transactions || transactions.length === 0) {
      return new Response("No transactions to export", { status: 400 });
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 25;

    // Header with logo/brand
    doc.setFillColor(37, 99, 235); // Blue color
    doc.rect(0, 0, pageWidth, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("CRONPAY", 20, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Digital Payment Solutions", 20, 26);

    // Reset text color
    doc.setTextColor(0, 0, 0);
    y = 50;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("ACCOUNT STATEMENT", 20, y);
    y += 15;

    // Statement info box
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, y, pageWidth - 40, 30, 2, 2, "S");

    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Statement Period:", 25, y);
    doc.setFont("helvetica", "normal");
    doc.text(getPeriodLabel(period), 65, y);

    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Date:", 25, y);
    doc.setFont("helvetica", "normal");
    doc.text(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      65,
      y
    );

    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Account Holder:", 25, y);
    doc.setFont("helvetica", "normal");
    doc.text(user, 65, y);

    y += 20;

    // Summary section
    const totalAmount = transactions
      .filter((tx) => tx.status === "completed")
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const completedCount = transactions.filter(
      (tx) => tx.status === "completed"
    ).length;
    const pendingCount = transactions.filter(
      (tx) => tx.status === "pending"
    ).length;
    // const failedCount = transactions.filter(
    //   (tx) => tx.status === "failed"
    // ).length;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 20, y);
    y += 8;

    // Summary table - linear layout
    const summaryData = [
      [
        `Total Amount: ${totalAmount.toFixed(2)} USD`,
        `Total Transactions: ${transactions.length}`,
        `Completed: ${completedCount}`,
        `Pending: ${pendingCount}`,
      ],
    ];

    autoTable(doc, {
      startY: y,
      body: summaryData,
      theme: "plain",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        halign: "center",
        valign: "middle",
        fontStyle: "bold",
        lineColor: [200, 200, 200],
        lineWidth: 0.3,
      },
      columnStyles: {
        0: { fillColor: [245, 245, 245] }, // light grey
        1: { fillColor: [255, 255, 255] },
        2: { fillColor: [245, 245, 245] },
        3: { fillColor: [255, 255, 255] },
      },
      margin: { left: 20, right: 20 },
      didDrawCell: (data) => {
        doc.setDrawColor(200, 200, 200);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
      },
    });

    y = (doc as any).lastAutoTable.finalY + 15;

    // Transactions section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Transaction Details", 20, y);
    y += 8;

    // Prepare transaction data for table
    const transactionData = transactions.map((tx) => {
      const date = new Date(tx.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const amount = `$${parseFloat(tx.amount).toFixed(2)} ${tx.currency}`;
      const status = tx.status.charAt(0).toUpperCase() + tx.status.slice(1);
      const hash = maskTxHash(tx.transaction_hash || "-");

      return [date, amount, status, hash];
    });

    // Transaction table with hyperlinks
    autoTable(doc, {
      startY: y,
      head: [["Date", "Amount", "Status", "Transaction Hash"]],
      body: transactionData,
      theme: "striped",
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 10,
        halign: "left",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 35, halign: "right" },
        2: { cellWidth: 30, halign: "center" },
        3: { cellWidth: 70, textColor: [37, 99, 235] },
      },
      margin: { left: 20, right: 20 },
      didDrawCell: (data: CellHookData) => {
        // Add hyperlinks to transaction hash column
        if (data.column.index === 3 && data.section === "body") {
          const hash = transactions[data.row.index].transaction_hash;
          if (hash) {
            const explorerUrl = `https://sepolia.etherscan.io/tx/${hash}`;
            doc.link(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height,
              { url: explorerUrl }
            );
          }
        }
      },
      // Add status color coding
      didParseCell: (data: CellHookData) => {
        if (data.column.index === 2 && data.section === "body") {
          const status = transactions[data.row.index].status;
          if (status === "completed") {
            data.cell.styles.textColor = [34, 139, 34]; // Green
            data.cell.styles.fontStyle = "bold";
          } else if (status === "pending") {
            data.cell.styles.textColor = [255, 140, 0]; // Orange
          } else if (status === "failed") {
            data.cell.styles.textColor = [220, 20, 60]; // Red
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    // End notice
    y = (doc as any).lastAutoTable.finalY + 15;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, y, pageWidth - 40, 12, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("*** End of Statement ***", pageWidth / 2, y + 8, {
      align: "center",
    });

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    doc.setTextColor(0, 0, 0);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

      // Footer text
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Generated on ${new Date().toLocaleDateString(
          "en-US"
        )} | CRONPAY Digital Payment Solutions`,
        20,
        pageHeight - 12
      );
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 12, {
        align: "right",
      });
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="CRONPAY-Statement-${period}-${
          new Date().toISOString().split("T")[0]
        }.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
