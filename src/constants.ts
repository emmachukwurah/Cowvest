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
    type: "Cowhide (Kpomo)",
    description: "Processing and distribution of high-quality cowhide, a popular local delicacy.",
    image: "/src/assets/images/cowhide_kpomo_1782918435479.jpg",
    minAmount: 100000,
    maxAmount: 10000000,
    returns: "20% in 6 months",
  },
  {
    type: "Sesame Seed",
    description: "Commercial cultivation, processing, and export aggregation of premium organic sesame seeds.",
    image: "/src/assets/images/sesame_seed_produce_1788299904157.jpg",
    minAmount: 100000,
    maxAmount: 10000000,
    returns: "20% in 6 months",
  },
  {
    type: "Cattle Breeding",
    description: "Multi-breed cattle ranching for superior livestock production.",
    image: "/src/assets/images/cattle_breeding_1782918374680.jpg",
    minAmount: 100000,
    maxAmount: 10000000,
    returns: "20% in 6 months",
  },
  {
    type: "Beef Processing",
    description: "Modern facility for premium beef cutting, packaging and distribution.",
    image: "/src/assets/images/beef_processing_1782918388763.jpg",
    minAmount: 100000,
    maxAmount: 10000000,
    returns: "20% in 6 months",
  },
  {
    type: "Dairy Production",
    description: "Large-scale dairy farm focusing on fresh milk and yoghurt processing.",
    image: "/src/assets/images/dairy_production_1782918403384.jpg",
    minAmount: 100000,
    maxAmount: 10000000,
    returns: "20% in 6 months",
  },
  {
    type: "Leather & Hides",
    description: "Sustainable tanning and leather production from premium cattle hides.",
    image: "/src/assets/images/leather_hides_1782918414801.jpg",
    minAmount: 100000,
    maxAmount: 10000000,
    returns: "20% in 6 months",
  },
  {
    type: "Organic Manure",
    description: "Processing cattle waste into high-grade organic fertilizers for crop farmers.",
    image: "/src/assets/images/organic_manure_1782918425624.jpg",
    minAmount: 100000,
    maxAmount: 10000000,
    returns: "20% in 6 months",
  }
];
