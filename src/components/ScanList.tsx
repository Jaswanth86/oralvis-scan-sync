import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Eye, Calendar, User, FileImage, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Scan {
  id: string;
  patient_name: string;
  patient_id: string | null;
  scan_type: string;
  file_path: string;
  file_size: number | null;
  notes: string | null;
  status: string;
  created_at: string;
  uploaded_by: string;
}

export function ScanList() {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchScans();
    }
  }, [user]);

  const fetchScans = async () => {
    try {
      let query = supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false });

      // If user is a technician, only show their own scans
      if (hasRole('technician')) {
        query = query.eq('uploaded_by', user?.id);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setScans(data || []);
    } catch (error: any) {
      toast({
        title: "Error Loading Scans",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateScanStatus = async (scanId: string, status: string) => {
    setUpdatingStatus(scanId);
    
    try {
      const { error } = await supabase
        .from('scans')
        .update({ status })
        .eq('id', scanId);

      if (error) {
        throw error;
      }

      setScans(prevScans =>
        prevScans.map(scan =>
          scan.id === scanId ? { ...scan, status } : scan
        )
      );

      toast({
        title: "Status Updated",
        description: `Scan status has been updated to ${status}.`,
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const viewScan = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('scans')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        throw error;
      }

      window.open(data.signedUrl, '_blank');
    } catch (error: any) {
      toast({
        title: "Error Opening Scan",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'reviewed':
        return 'secondary';
      case 'approved':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {hasRole('dentist') ? 'All Scans' : 'My Scans'}
        </h2>
        <Badge variant="outline" className="text-sm">
          {scans.length} scan{scans.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {scans.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Scans Found</h3>
            <p className="text-muted-foreground">
              {hasRole('technician') 
                ? "You haven't uploaded any scans yet." 
                : "No scans available for review."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {scans.map((scan) => (
            <Card key={scan.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{scan.patient_name}</CardTitle>
                    <CardDescription className="flex items-center space-x-4">
                      <span className="capitalize">{scan.scan_type.replace('-', ' ')}</span>
                      {scan.patient_id && (
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          ID: {scan.patient_id}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(scan.status)} className="capitalize">
                    {scan.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
                    </div>
                    <div>{formatFileSize(scan.file_size)}</div>
                    {scan.notes && (
                      <div className="mt-2 text-foreground">
                        <strong>Notes:</strong> {scan.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewScan(scan.file_path)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    
                    {hasRole('dentist') && (
                      <Select
                        value={scan.status}
                        onValueChange={(value) => updateScanStatus(scan.id, value)}
                        disabled={updatingStatus === scan.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}