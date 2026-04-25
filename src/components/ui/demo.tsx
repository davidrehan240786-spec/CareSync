import { Cta4 } from "@/src/components/ui/cta-4";

const DemoOne = () => {
  return (
    <Cta4
      title="Ready to Care Smarter?"
      description="Join thousands of patients who trust CareSync for their portable health records and effortless medication management."
      buttonText="Get Started"
      buttonUrl="#"
      items={[
        "Secure Portable Health ID",
        "AI-Powered Patient Summaries",
        "Smart Medication Reminders",
        "Instant WhatsApp Alerts",
        "Real-time Doctor Sync"
      ]}
    />
  );
};

export { DemoOne };
