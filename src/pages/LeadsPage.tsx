import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Lead, LeadStatus, ProductType } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Pencil, Trash2, UserCheck, ClipboardList } from 'lucide-react';
import { AddLeadDialog } from '@/components/leads/AddLeadDialog';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { ConvertToRegistrationDialog } from '@/components/leads/ConvertToRegistrationDialog';

const ALL = 'הכל';
const STATUSES: LeadStatus[] = ['חדש', 'מטופל', 'ביצירת קשר', 'רשום', 'לא מעוניין', 'ישן'];
const PRODUCT_TYPES: ProductType[] = ['קורס', 'חוג', 'קייטנה'];

export default function LeadsPage() {
  const { leads, addLead, updateLead, deleteLead, seasons, pools } = useData();
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(ALL);
  const [filterType, setFilterType] = useState<string>(ALL);
  const [addOpen, setAddOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      const matchSearch = !q
        || l.name.toLowerCase().includes(q)
        || l.phone.includes(q)
        || l.email.toLowerCase().includes(q)
        || l.idNumber.includes(q);
      const matchStatus = filterStatus === ALL || l.status === filterStatus;
      const matchType = filterType === ALL || l.requestedProductType === filterType;
      return matchSearch && matchStatus && matchType;
    });
  }, [leads, search, filterStatus, filterType]);

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    STATUSES.forEach((s) => { result[s] = leads.filter((l) => l.status === s).length; });
    return result;
  }, [leads]);

  const handleAdd = (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editLead) {
      updateLead({ ...editLead, ...data });
      setEditLead(null);
    } else {
      addLead(data);
    }
  };

  const handleStatusChange = (lead: Lead, newStatus: LeadStatus) => {
    updateLead({ ...lead, status: newStatus });
    toast({ title: `סטטוס עודכן ל"${newStatus}"`, description: lead.name });
  };

  return (
    <div className="container mx-auto p-4 space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ניהול לידים</h1>
        {isAdmin() && (
          <Button onClick={() => { setEditLead(null); setAddOpen(true); }}>
            <Plus className="h-4 w-4 ml-1" /> הוסף ליד
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {STATUSES.map((s) => (
          <Card
            key={s}
            className={`cursor-pointer transition-shadow hover:shadow-md ${filterStatus === s ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setFilterStatus(filterStatus === s ? ALL : s)}
          >
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s}</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              <p className="text-2xl font-bold">{counts[s] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי שם, טלפון, ת.ז, אימייל..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-8"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue placeholder="סטטוס" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>כל הסטטוסים</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36"><SelectValue placeholder="סוג פעילות" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>כל הסוגים</SelectItem>
            {PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">שם</TableHead>
              <TableHead className="text-right">ת.ז</TableHead>
              <TableHead className="text-right">טלפון</TableHead>
              <TableHead className="text-right">אימייל</TableHead>
              <TableHead className="text-right">סוג פעילות</TableHead>
              <TableHead className="text-right">סטטוס</TableHead>
              <TableHead className="text-right">הערות</TableHead>
              {isAdmin() && <TableHead className="text-right">פעולות</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin() ? 8 : 7} className="text-center text-muted-foreground py-8">
                  לא נמצאו לידים
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {lead.name}
                    {lead.convertedToParticipantId && (
                      <UserCheck className="inline h-3 w-3 mr-1 text-green-600" title="הומר לרישום" />
                    )}
                  </TableCell>
                  <TableCell dir="ltr" className="text-sm text-muted-foreground">{lead.idNumber}</TableCell>
                  <TableCell dir="ltr">{lead.phone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{lead.email}</TableCell>
                  <TableCell>
                    {lead.requestedProductType
                      ? <Badge variant="secondary" className="text-xs">{lead.requestedProductType}</Badge>
                      : <span className="text-muted-foreground text-sm">—</span>}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={lead.status}
                      onValueChange={(v) => handleStatusChange(lead, v as LeadStatus)}
                    >
                      <SelectTrigger className="h-7 w-28 border-0 p-0 shadow-none focus:ring-0">
                        <LeadStatusBadge status={lead.status} />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            <LeadStatusBadge status={s} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {lead.notes ?? '—'}
                  </TableCell>
                  {isAdmin() && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm" variant="ghost"
                          title="שייך לקורס"
                          disabled={!!lead.convertedToParticipantId}
                          onClick={() => setConvertLead(lead)}
                        >
                          <ClipboardList className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditLead(lead); setAddOpen(true); }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(lead.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddLeadDialog
        open={addOpen}
        onOpenChange={(o) => { setAddOpen(o); if (!o) setEditLead(null); }}
        onAdd={handleAdd}
        editLead={editLead}
      />

      {convertLead && (
        <ConvertToRegistrationDialog
          lead={convertLead}
          seasons={seasons}
          pools={pools}
          open={!!convertLead}
          onOpenChange={(o) => { if (!o) setConvertLead(null); }}
          onDone={() => setConvertLead(null)}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת ליד</AlertDialogTitle>
            <AlertDialogDescription>האם אתה בטוח שברצונך למחוק את הליד? לא ניתן לבטל פעולה זו.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => { if (deleteId) { await deleteLead(deleteId); setDeleteId(null); } }}
              className="bg-destructive text-destructive-foreground"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
