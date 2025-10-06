import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { fetchView } from '@/lib/api';
import { parseErr } from '@/lib/auth-utils';
import { RefreshCw } from 'lucide-react';

interface ResidentOption {
  id: string;
  full_name: string;
  room: string | null;
}

interface ResidentSelectProps {
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ResidentSelect({ value, onChange, disabled, placeholder = "Select resident" }: ResidentSelectProps) {
  const [residents, setResidents] = useState<ResidentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResidents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchView<ResidentOption>('v_residents', 'id, full_name, room', {
        orderBy: { column: 'full_name', ascending: true },
        limit: 50
      });
      
      setResidents(data);
    } catch (err) {
      const errorMsg = parseErr(err);
      setError(errorMsg);
      console.error('ResidentSelect: Failed to load residents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResidents();
  }, []);

  if (error) {
    return (
      <div className="space-y-2">
        <Select disabled value="">
          <SelectTrigger className="border-destructive">
            <SelectValue placeholder="Failed to load residents" />
          </SelectTrigger>
        </Select>
        <div className="flex items-center gap-2">
          <p className="text-xs text-destructive">{error}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={loadResidents}
            className="h-6"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Select 
      value={value} 
      onValueChange={onChange}
      disabled={disabled || loading}
    >
      <SelectTrigger>
        <SelectValue placeholder={loading ? "Loading residents..." : placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-background border z-50">
        {residents.map((resident) => (
          <SelectItem key={resident.id} value={resident.id}>
            {resident.full_name} — {resident.room || 'Unknown'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
