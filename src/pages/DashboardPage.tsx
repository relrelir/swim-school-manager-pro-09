import { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, BookOpen, TrendingUp, UserPlus, DollarSign, CheckCircle } from 'lucide-react';

const PRODUCT_TYPE_COLORS: Record<string, string> = {
  'קורס': '#3b82f6',
  'חוג': '#10b981',
  'קייטנה': '#f59e0b',
};

function StatCard({
  title, value, subtitle, icon: Icon, color = 'text-primary',
}: {
  title: string; value: string | number; subtitle?: string; icon: React.ElementType; color?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full bg-muted ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { registrations, products, participants, payments, leads, seasons, getAllRegistrationsWithDetails } = useData();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    // Use pre-computed effectiveRequiredAmount from RegistrationWithDetails — single source of truth
    // that already accounts for approved discounts and is kept in sync with payment docs.
    const totalRequired = getAllRegistrationsWithDetails().reduce(
      (sum, r) => sum + r.effectiveRequiredAmount,
      0
    );
    const healthApproved = participants.filter((p) => p.healthApproval).length;
    const newLeads = leads.filter((l) => l.status === 'חדש').length;

    // Registrations per product type
    const byType: Record<string, number> = { 'קורס': 0, 'חוג': 0, 'קייטנה': 0 };
    registrations.forEach((r) => {
      const product = products.find((p) => p.id === r.productId);
      if (product?.type) byType[product.type] = (byType[product.type] ?? 0) + 1;
    });

    // Occupancy per product (top 8)
    const occupancy = products
      .map((p) => {
        const count = registrations.filter((r) => r.productId === p.id).length;
        return { name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name, count, max: p.maxParticipants };
      })
      .filter((p) => p.max > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return { totalPaid, totalRequired, healthApproved, newLeads, byType, occupancy };
  }, [registrations, products, participants, payments, leads]);

  const pieData = Object.entries(stats.byType)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="container mx-auto p-4 space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold">דשבורד</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="רישומים" value={registrations.length} icon={BookOpen} />
        <StatCard title="משתתפים" value={participants.length} icon={Users} />
        <StatCard title="לידים חדשים" value={stats.newLeads} icon={UserPlus} color="text-blue-600" />
        <StatCard
          title="הצהרות בריאות"
          value={`${stats.healthApproved}/${participants.length}`}
          subtitle="אושרו"
          icon={CheckCircle}
          color="text-green-600"
        />
        {isAdmin() && (
          <>
            <StatCard
              title="הכנסות"
              value={`₪${stats.totalPaid.toLocaleString()}`}
              icon={DollarSign}
              color="text-green-600"
            />
            <StatCard
              title="יתרה לגביה"
              value={`₪${Math.max(0, stats.totalRequired - stats.totalPaid).toLocaleString()}`}
              icon={TrendingUp}
              color={stats.totalRequired > stats.totalPaid ? 'text-amber-600' : 'text-green-600'}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">תפוסת קורסים</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.occupancy.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">אין נתונים</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.occupancy} layout="vertical" margin={{ right: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, name) => [value, name === 'count' ? 'רשומים' : 'מקסימום']}
                  />
                  <Bar dataKey="count" name="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="max" name="max" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Type distribution pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">פילוח לפי סוג פעילות</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">אין נתונים</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={PRODUCT_TYPE_COLORS[entry.name] ?? '#94a3b8'} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seasons summary */}
      {seasons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">עונות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {seasons.map((season) => {
                const seasonProducts = products.filter((p) => p.seasonId === season.id);
                const seasonRegs = registrations.filter((r) =>
                  seasonProducts.some((p) => p.id === r.productId)
                );
                return (
                  <div
                    key={season.id}
                    className="border rounded-md p-3 space-y-1 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/season/${season.id}/pools`)}
                    title="עבור לעונה"
                  >
                    <p className="font-semibold text-sm">{season.name}</p>
                    <p className="text-xs text-muted-foreground">{seasonProducts.length} קורסים</p>
                    <p className="text-xs text-muted-foreground">{seasonRegs.length} רישומים</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
