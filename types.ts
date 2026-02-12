
export interface MachinePart {
  id: string;
  name: string;
  type: string;
  material: string;
  rawMaterials: string;
  units: string;
  lastUpdated: string;
  confidence: number;
  imageUrl?: string;
}

export interface ExtractionResult {
  name: string;
  type: string;
  material: string;
  rawMaterials: string;
  units: string;
}
