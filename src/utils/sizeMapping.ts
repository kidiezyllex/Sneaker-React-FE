export interface SizeMapping {
  value: number;
  label: string;
}

export const SIZE_MAPPINGS: SizeMapping[] = [];

export const getSizeLabel = (value: number): string => {
  return value.toString();
};

export const getSizeValue = (label: string): number | null => {
  const val = parseFloat(label);
  return isNaN(val) ? null : val;
};

export const getAllSizeLabels = (): string[] => {
  return SIZE_MAPPINGS.map(size => size.label);
};

export const getAllSizeValues = (): number[] => {
  return SIZE_MAPPINGS.map(size => size.value);
};

export const isValidSizeValue = (value: number): boolean => {
  return SIZE_MAPPINGS.some(size => Math.abs(size.value - value) < 0.001);
};

export const isValidSizeLabel = (label: string): boolean => {
  return SIZE_MAPPINGS.some(size => size.label === label);
};