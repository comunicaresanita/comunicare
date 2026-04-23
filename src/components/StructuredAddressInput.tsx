import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StructuredAddressInputProps {
  via: string;
  civico: string;
  cap: string;
  citta: string;
  onViaChange: (val: string) => void;
  onCivicoChange: (val: string) => void;
  onCapChange: (val: string) => void;
  onCittaChange: (val: string) => void;
  required?: boolean;
  label?: string;
}

export function parseAddressToFields(address: string) {
  // Try to parse "Via X 123, 50100 Città" format
  const parts = address.split(",").map((s) => s.trim());
  let via = "";
  let civico = "";
  let cap = "";
  let citta = "";

  if (parts.length >= 2) {
    // First part: street + number
    const streetPart = parts[0];
    const match = streetPart.match(/^(.+?)\s+(\d+\S*)$/);
    if (match) {
      via = match[1];
      civico = match[2];
    } else {
      via = streetPart;
    }
    // Second part: CAP + city
    const capCityPart = parts.slice(1).join(", ").trim();
    const capMatch = capCityPart.match(/^(\d{5})\s+(.+)$/);
    if (capMatch) {
      cap = capMatch[1];
      citta = capMatch[2];
    } else {
      citta = capCityPart;
    }
  } else {
    via = address;
  }

  return { via, civico, cap, citta };
}

export function composeAddress(via: string, civico: string, cap: string, citta: string) {
  return `${via} ${civico}, ${cap} ${citta}`.trim();
}

const StructuredAddressInput = ({
  via,
  civico,
  cap,
  citta,
  onViaChange,
  onCivicoChange,
  onCapChange,
  onCittaChange,
  required = false,
  label = "Indirizzo",
}: StructuredAddressInputProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-senior-sm font-semibold">{label}</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-muted-foreground">Via / Piazza *</Label>
          <Input
            value={via}
            onChange={(e) => onViaChange(e.target.value)}
            placeholder="Es. Via Roma"
            required={required}
            className="text-senior-sm py-3"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Numero civico *</Label>
          <Input
            value={civico}
            onChange={(e) => onCivicoChange(e.target.value)}
            placeholder="Es. 15"
            required={required}
            className="text-senior-sm py-3"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">CAP *</Label>
          <Input
            value={cap}
            onChange={(e) => onCapChange(e.target.value)}
            placeholder="Es. 00100"
            maxLength={5}
            required={required}
            className="text-senior-sm py-3"
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-muted-foreground">Città *</Label>
          <Input
            value={citta}
            onChange={(e) => onCittaChange(e.target.value)}
            placeholder="Es. Roma"
            required={required}
            className="text-senior-sm py-3"
          />
        </div>
      </div>
    </div>
  );
};

export default StructuredAddressInput;
