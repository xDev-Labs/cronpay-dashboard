import { NextRequest } from "next/server";
import { jsPDF } from "jspdf";

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
    let y = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("CRONPAY", 20, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Crypto Payment Gateway", 20, y);
    y += 10;

    // Line
    doc.setLineWidth(0.5);
    doc.line(20, y, pageWidth - 20, y);
    y += 15;

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ACCOUNT STATEMENT", 20, y);
    y += 15;

    // Period and date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Statement Period: ${getPeriodLabel(period)}`, 20, y);
    y += 6;
    doc.text(
      `Date: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      20,
      y
    );
    y += 15;

    // Account holder
    doc.setFont("helvetica", "bold");
    doc.text("Account Holder:", 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(user, 20, y);
    y += 15;

    // Summary
    const totalAmount = transactions
      .filter((tx) => tx.status === "completed")
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const completedCount = transactions.filter(
      (tx) => tx.status === "completed"
    ).length;

    doc.setFont("helvetica", "bold");
    doc.text("Summary", 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`Total Transactions: ${transactions.length}`, 20, y);
    y += 6;
    doc.text(`Completed: ${completedCount}`, 20, y);
    y += 6;
    doc.text(`Total Amount: $${totalAmount.toFixed(2)} USD`, 20, y);
    y += 15;

    // Transaction table
    doc.setFont("helvetica", "bold");
    doc.text("Transactions", 20, y);
    y += 8;

    // Table header
    doc.setFontSize(9);
    doc.text("Date", 20, y);
    doc.text("Transaction Hash", 50, y);
    doc.text("Amount", 110, y);
    doc.text("Status", 140, y);

    y += 2;

    // Header line
    doc.setLineWidth(0.3);
    doc.line(20, y, pageWidth - 20, y);
    y += 6;

    // Table rows
    doc.setFont("helvetica", "normal");
    transactions.forEach((tx) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }

      const date = new Date(tx.created_at).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      });

      const amount = `$${parseFloat(tx.amount).toFixed(2)}`;
      const status = tx.status.charAt(0).toUpperCase() + tx.status.slice(1);
      const hash = tx.transaction_hash ? tx.transaction_hash : "-";

      doc.text(date, 20, y);
      doc.text(hash, 50, y);
      doc.text(amount, 110, y);
      doc.text(status, 140, y);

      y += 7;
    });

    y += 5;
    doc.setLineWidth(0.3);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    // End notice
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("*** End of Statement ***", pageWidth / 2, y, { align: "center" });

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, {
        align: "right",
      });
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="statement-${period}-${
          new Date().toISOString().split("T")[0]
        }.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
