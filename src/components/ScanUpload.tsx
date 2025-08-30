import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2 } from 'lucide-react';

export function ScanUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    scanType: '',
    notes: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setLoading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('scans')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Save scan metadata to database
      const { error: dbError } = await supabase
        .from('scans')
        .insert({
          patient_name: formData.patientName,
          patient_id: formData.patientId || null,
          scan_type: formData.scanType,
          uploaded_by: user.id,
          file_path: filePath,
          file_size: file.size,
          notes: formData.notes || null,
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Scan Uploaded Successfully",
        description: "The scan has been uploaded and is now available for review.",
      });

      // Reset form
      setFormData({
        patientName: '',
        patientId: '',
        scanType: '',
        notes: '',
      });
      setFile(null);

    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload New Scan</span>
        </CardTitle>
        <CardDescription>
          Upload oral health scans for dentist review
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient-name">Patient Name</Label>
              <Input
                id="patient-name"
                placeholder="Enter patient name"
                value={formData.patientName}
                onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient-id">Patient ID (Optional)</Label>
              <Input
                id="patient-id"
                placeholder="Enter patient ID"
                value={formData.patientId}
                onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scan-type">Scan Type</Label>
            <Select value={formData.scanType} onValueChange={(value) => setFormData(prev => ({ ...prev, scanType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select scan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intraoral">Intraoral Scan</SelectItem>
                <SelectItem value="panoramic">Panoramic X-ray</SelectItem>
                <SelectItem value="bite-wing">Bite-wing X-ray</SelectItem>
                <SelectItem value="periapical">Periapical X-ray</SelectItem>
                <SelectItem value="3d-cbct">3D CBCT Scan</SelectItem>
                <SelectItem value="impression">Digital Impression</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Scan File</Label>
            <Input
              id="file-upload"
              type="file"
              accept="image/*,.dcm,.stl"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or observations"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !file}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload Scan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}