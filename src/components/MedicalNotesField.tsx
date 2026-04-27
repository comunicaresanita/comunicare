import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MedicalNotesFieldProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  idPrefix?: string;
}

const MedicalNotesField = ({
  value,
  onChange,
  label = "Note importanti sulla condizione (opzionale)",
  idPrefix = "med-notes",
}: MedicalNotesFieldProps) => {
  return (
    <div className="space-y-1">
      <Label htmlFor={idPrefix} className="text-senior-sm">{label}</Label>
      <Textarea
        id={idPrefix}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={'Es. patologie croniche o allergie, farmaci in uso, ausili presenti in casa (sollevatore, deambulatore...)'}
        rows={3}
        className="text-senior-sm"
      />
    </div>
  );
};

export default MedicalNotesField;
