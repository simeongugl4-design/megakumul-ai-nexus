import { motion } from "framer-motion";
import { Check, Zap, Crown, Building2, Sparkles } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Get started with AI intelligence",
    icon: Zap,
    color: "border-border",
    badge: null,
    features: [
      "10 AI Chat queries/day",
      "5 Research queries/day",
      "3 Image generations/day",
      "Basic Math Solver",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "/month",
    description: "For students, researchers & professionals",
    icon: Sparkles,
    color: "border-primary",
    badge: "Most Popular",
    features: [
      "Unlimited AI Chat",
      "Unlimited Deep Research",
      "50 Image generations/day",
      "Advanced Math Solver + PDF upload",
      "Code Assistant with all languages",
      "Document AI analysis",
      "Priority response speed",
      "Chat history & saved responses",
    ],
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/month",
    description: "Maximum power for teams & businesses",
    icon: Crown,
    color: "border-[hsl(45,90%,55%)]",
    badge: "Best Value",
    features: [
      "Everything in Pro",
      "Unlimited Image generation",
      "GPT-5 & Gemini Pro models",
      "3D Interactive diagrams",
      "Knowledge Base (unlimited)",
      "API access",
      "Priority 24/7 support",
      "Custom integrations",
      "Team collaboration tools",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Tailored for organizations",
    icon: Building2,
    color: "border-secondary",
    badge: null,
    features: [
      "Everything in Premium",
      "Dedicated infrastructure",
      "Custom AI model training",
      "SLA & uptime guarantee",
      "Dedicated account manager",
      "On-premise deployment option",
      "Volume discounts",
    ],
  },
];

const comparisons = [
  { name: "ChatGPT Plus", price: "$20/mo", features: "GPT-4, DALL·E, limited plugins" },
  { name: "Perplexity Pro", price: "$20/mo", features: "Research, citations, limited models" },
  { name: "MegaKUMUL Pro", price: "$4.99/mo", features: "Chat, Research, Images, Math, Code, Diagrams — ALL included", highlight: true },
];

export default function PricingPage() {
  const [selectedModel, setSelectedModel] = useState("creative");
  const [annual, setAnnual] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <TopNav selectedModel={selectedModel} onModelChange={setSelectedModel} />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl font-heading font-bold gradient-text mb-3">Simple, Affordable Pricing</h1>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
              Get more AI power for less. MegaKUMUL costs up to <span className="text-primary font-semibold">75% less</span> than ChatGPT and Perplexity combined.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-border p-1">
              <button onClick={() => setAnnual(false)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${!annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Monthly</button>
              <button onClick={() => setAnnual(true)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Annual <span className="text-xs opacity-80">(-20%)</span></button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border ${plan.color} bg-card p-6 flex flex-col ${plan.badge ? "ring-2 ring-primary/30" : ""}`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">{plan.badge}</span>
                )}
                <plan.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-lg font-heading font-bold">{plan.name}</h3>
                <div className="mt-2 mb-1">
                  <span className="text-3xl font-bold">
                    {plan.price === "Custom" ? "Custom" : annual && plan.price !== "$0" ? `$${(parseFloat(plan.price.slice(1)) * 0.8).toFixed(2)}` : plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full rounded-xl py-2.5 text-sm font-medium transition-all ${plan.badge ? "bg-primary text-primary-foreground hover:opacity-90" : "border border-border text-foreground hover:bg-muted"}`}>
                  {plan.price === "Custom" ? "Contact Sales" : plan.price === "$0" ? "Get Started Free" : "Subscribe Now"}
                </button>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-12">
            <h2 className="text-2xl font-heading font-bold text-center mb-6">How We Compare</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {comparisons.map((c) => (
                <div key={c.name} className={`rounded-2xl border p-5 ${c.highlight ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-card"}`}>
                  <h4 className={`font-heading font-bold text-lg ${c.highlight ? "text-primary" : ""}`}>{c.name}</h4>
                  <p className="text-2xl font-bold my-2">{c.price}</p>
                  <p className="text-xs text-muted-foreground">{c.features}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
