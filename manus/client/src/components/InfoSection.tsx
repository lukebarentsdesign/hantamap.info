import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface InfoCard {
  id: string;
  title: string;
  content: string;
}

const INFO_CARDS: InfoCard[] = [
  {
    id: "what-is",
    title: "What is Hantavirus?",
    content:
      "Hantavirus is a potentially deadly virus spread primarily by infected rodents through contact with their urine, droppings, or saliva. The virus can cause Hantavirus Pulmonary Syndrome (HPS), a severe respiratory disease. While rare, HPS has a high mortality rate if untreated. Prevention focuses on avoiding contact with rodents and their contaminated materials.",
  },
  {
    id: "symptoms",
    title: "Symptoms",
    content:
      "Early symptoms of hantavirus infection typically appear 1-8 weeks after exposure and include fever, muscle aches, headache, and fatigue. As the illness progresses, symptoms may include cough, shortness of breath, chest discomfort, and severe respiratory distress. Seek immediate medical attention if you experience these symptoms, especially if you've had potential rodent exposure.",
  },
  {
    id: "transmission",
    title: "How It Spreads",
    content:
      "Hantavirus is primarily transmitted to humans through inhalation of virus particles from infected rodent droppings, urine, or saliva. Direct contact with infected rodents or their nesting materials can also transmit the virus. Person-to-person transmission is extremely rare. Avoid disturbing rodent nests and use proper protective equipment when cleaning areas with rodent activity.",
  },
  {
    id: "prevention",
    title: "Prevention Tips",
    content:
      "To reduce your risk: seal cracks and holes in buildings, store food in rodent-proof containers, use snap traps or electronic traps to control rodents, and clean up rodent droppings using proper safety precautions. When cleaning contaminated areas, wear gloves and a mask, spray the area with disinfectant before sweeping, and avoid creating dust. Consult health authorities for professional pest control if needed.",
  },
];

export function InfoSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section id="info" className="section-padding bg-background">
      <div className="container">
        <h2 className="text-4xl font-bold mb-4">About Hantavirus</h2>
        <p className="text-muted-foreground mb-12 max-w-2xl">
          Essential information about hantavirus, its symptoms, transmission, and prevention measures.
        </p>

        <div className="max-w-3xl space-y-4">
          {INFO_CARDS.map((card) => (
            <div
              key={card.id}
              className="glass-effect rounded-lg overflow-hidden transition-all"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === card.id ? null : card.id)
                }
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <h3 className="font-bold text-lg text-left">{card.title}</h3>
                <ChevronDown
                  size={20}
                  className={`flex-shrink-0 transition-transform ${
                    expandedId === card.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedId === card.id && (
                <div className="px-6 py-4 border-t border-border bg-white/2">
                  <p className="text-foreground/80 leading-relaxed">
                    {card.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-yellow-600/10 border border-yellow-600/30 rounded-lg">
          <p className="text-sm text-yellow-100">
            <strong>Medical Disclaimer:</strong> This information is for educational purposes only and should not be used as a substitute for professional medical advice. If you believe you have been exposed to hantavirus or are experiencing symptoms, consult a healthcare provider immediately.
          </p>
        </div>
      </div>
    </section>
  );
}
