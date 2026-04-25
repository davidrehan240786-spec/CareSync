import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Is my medical data secure?",
    answer:
      "Yes. We use hospital-grade AES-256 encryption for all data storage and end-to-end encryption for doctor-patient communications. Our platform is built with HIPAA and GDPR compliance in mind.",
  },
  {
    question: "How does the QR code work?",
    answer:
      "Your unique QR code acts as a secure pointer to your encrypted medical profile. When authorized healthcare providers scan it, they gain temporary access to your history and clinical summaries to provide better care.",
  },
  {
    question: "Is CareSync free for patients?",
    answer:
      "Yes, for individual patients, CareSync is completely free to generate your portable health ID, track medications via WhatsApp, and store your primary medical records.",
  },
  {
    question: "What happens if I lose my phone?",
    answer:
      "Your data is securely backed up in the cloud. You can simply log in from a new device using your credentials to regain access to your medical vault and regenerate your QR code.",
  },
  {
    question: "Can any doctor access my data?",
    answer:
      "No. You have full control over who sees your data. Access is only granted when the QR is physically scanned in a clinical setting, and you can revoke access at any time through your patient dashboard.",
  },
  {
    question: "How does the AI health summary work?",
    answer:
      "Our clinical engine analyzes your uploaded reports and vitals to highlight key trends and potential red flags. This helps doctors quickly understand your health status without reading through hundreds of pages.",
  },
];

export function FAQAccordionBlock() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full bg-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center md:mb-16"
        >
          <Badge className="mb-4" variant="secondary">
            <HelpCircle className="mr-1 h-3 w-3" />
            FAQ
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
            Have a question? We've got answers. If you don't find what you're
            looking for, feel free to contact us.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Card className="overflow-hidden border-border/50 bg-white transition-all hover:border-primary/50 hover:shadow-md">
                  <motion.button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-4 text-left md:p-6"
                    whileHover={{
                      backgroundColor: "rgba(0, 0, 0, 0.01)",
                    }}
                  >
                    <span className="pr-4 text-base font-semibold md:text-lg">
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/50 p-4 md:p-6">
                          <motion.p
                            initial={{ y: -10 }}
                            animate={{ y: 0 }}
                            className="text-sm text-muted-foreground md:text-base"
                          >
                            {faq.answer}
                          </motion.p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
