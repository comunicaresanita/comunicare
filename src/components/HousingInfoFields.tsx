import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface HousingInfoErrors {
  livesInCondominio?: boolean;
  intercomName?: boolean;
  floorNumber?: boolean;
}

interface HousingInfoFieldsProps {
  livesInCondominio: boolean | null;
  intercomName: string;
  floorNumber: string;
  accessNotes: string;
  onLivesInCondominioChange: (v: boolean) => void;
  onIntercomNameChange: (v: string) => void;
  onFloorNumberChange: (v: string) => void;
  onAccessNotesChange: (v: string) => void;
  errors?: HousingInfoErrors;
  idPrefix?: string;
  title?: string;
}

const HousingInfoFields = ({
  livesInCondominio,
  intercomName,
  floorNumber,
  accessNotes,
  onLivesInCondominioChange,
  onIntercomNameChange,
  onFloorNumberChange,
  onAccessNotesChange,
  errors = {},
  idPrefix = "housing",
  title = "Abiti in un condominio?",
}: HousingInfoFieldsProps) => {
  const value = livesInCondominio === null ? "" : livesInCondominio ? "yes" : "no";
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-senior-sm">{title} *</Label>
        <RadioGroup
          value={value}
          onValueChange={(v) => onLivesInCondominioChange(v === "yes")}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem id={`${idPrefix}-cond-yes`} value="yes" />
            <Label htmlFor={`${idPrefix}-cond-yes`} className="cursor-pointer">Sì</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id={`${idPrefix}-cond-no`} value="no" />
            <Label htmlFor={`${idPrefix}-cond-no`} className="cursor-pointer">No</Label>
          </div>
        </RadioGroup>
        {errors.livesInCondominio && (
          <p className="text-sm text-destructive">Seleziona un'opzione.</p>
        )}
      </div>

      {livesInCondominio === true && (
        <div className="space-y-3 p-3 rounded-md border border-border bg-muted/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor={`${idPrefix}-intercom`} className="text-senior-sm">Nome sul citofono *</Label>
              <Input
                id={`${idPrefix}-intercom`}
                value={intercomName}
                onChange={(e) => onIntercomNameChange(e.target.value)}
                placeholder="Es. Rossi"
                className={`text-senior-sm py-3 ${errors.intercomName ? "border-destructive" : ""}`}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`${idPrefix}-floor`} className="text-senior-sm">N° piano *</Label>
              <Input
                id={`${idPrefix}-floor`}
                value={floorNumber}
                onChange={(e) => onFloorNumberChange(e.target.value)}
                placeholder="Es. 3"
                className={`text-senior-sm py-3 ${errors.floorNumber ? "border-destructive" : ""}`}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${idPrefix}-access-notes`} className="text-senior-sm">Note sull'accesso (opzionale)</Label>
            <Textarea
              id={`${idPrefix}-access-notes`}
              value={accessNotes}
              onChange={(e) => onAccessNotesChange(e.target.value)}
              placeholder='Es. "C&apos;è facilità di parcheggio?", "C&apos;è l&apos;ascensore?"'
              rows={2}
              className="text-senior-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HousingInfoFields;
