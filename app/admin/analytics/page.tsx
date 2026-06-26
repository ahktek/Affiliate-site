import AnalyticsClient from "./AnalyticsClient";

export const metadata = {
  title: "Analytics Dashboard | Optura Vibe Admin Panel",
  description: "View real-time page traffic, affiliate conversion tracking, head-to-head comparison events, and newsletter subscription growth charts.",
};

export default function AnalyticsPage() {
  return <AnalyticsClient />;
}
