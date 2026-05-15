import { ProduceType } from "./types";

interface ProduceOption {
  type: ProduceType;
  description: string;
  image: string;
  minAmount: number;
  maxAmount: number;
  returns: string;
}

export const PRODUCE_OPTIONS: ProduceOption[] = [
  {
    type: "Cattle Breeding",
    description: "Multi-breed cattle ranching for superior livestock production.",
    image: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800",
    minAmount: 100000,
    maxAmount: 1000000,
    returns: "50% in 6 months",
  },
  {
    type: "Beef Processing",
    description: "Modern facility for premium beef cutting, packaging and distribution.",
    image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=800",
    minAmount: 200000,
    maxAmount: 1000000,
    returns: "50% in 6 months",
  },
  {
    type: "Dairy Production",
    description: "Large-scale dairy farm focusing on fresh milk and yoghurt processing.",
    image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800",
    minAmount: 150000,
    maxAmount: 1000000,
    returns: "50% in 6 months",
  },
  {
    type: "Leather & Hides",
    description: "Sustainable tanning and leather production from premium cattle hides.",
    image: "https://images.unsplash.com/photo-1524292332606-43bc3a515a3a?auto=format&fit=crop&q=80&w=800",
    minAmount: 100000,
    maxAmount: 1000000,
    returns: "50% in 6 months",
  },
  {
    type: "Organic Manure",
    description: "Processing cattle waste into high-grade organic fertilizers for crop farmers.",
    image: "https://images.unsplash.com/photo-1589923188900-85dae525514c?auto=format&fit=crop&q=80&w=800",
    minAmount: 100000,
    maxAmount: 1000000,
    returns: "50% in 6 months",
  },
  {
    type: "Cowhide (Kpomo)",
    description: "Processing and distribution of high-quality cowhide, a popular local delicacy.",
    image: "https://images.unsplash.com/photo-1628289069542-f8ab5734208a?auto=format&fit=crop&q=80&w=800",
    minAmount: 100000,
    maxAmount: 1000000,
    returns: "50% in 6 months",
  }
];
