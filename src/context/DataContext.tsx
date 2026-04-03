import React, { useCallback, useContext } from 'react';
import { SeasonsProvider, useSeasonsContext } from './data/SeasonsProvider';
import { PoolsProvider, usePoolsContext } from './data/PoolsProvider';
import { ProductsProvider, useProductsContext } from './data/ProductsProvider';
import { ParticipantsProvider, useParticipantsContext } from './data/ParticipantsProvider';
import { RegistrationsProvider, useRegistrationsContext } from './data/RegistrationsProvider';
import { PaymentsProvider, usePaymentsContext } from './data/PaymentsProvider';
import { HealthDeclarationsProvider, useHealthDeclarationsContext } from './data/HealthDeclarationsProvider';
import { LeadsProvider, useLeadsContext } from './data/LeadsProvider';
import { CombinedDataContextType } from './data/types';
import { Product } from '@/types';
import { calcRegistrationFinancials } from '@/utils/financialCalculations';

const DataContext = React.createContext<CombinedDataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

const DAY_MAP: Record<string, number> = {
  'ראשון': 0, 'שני': 1, 'שלישי': 2, 'רביעי': 3, 'חמישי': 4, 'שישי': 5, 'שבת': 6,
};

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const DataConsumer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const seasonsContext = useSeasonsContext();
  const poolsContext = usePoolsContext();
  const productsContext = useProductsContext();
  const participantsContext = useParticipantsContext();
  const registrationsContext = useRegistrationsContext();
  const paymentsContext = usePaymentsContext();
  const healthDeclarationsContext = useHealthDeclarationsContext();
  const leadsContext = useLeadsContext();

  const getAllRegistrationsWithDetails = useCallback(() => {
    const { registrations } = registrationsContext;
    const { products } = productsContext;
    const { seasons } = seasonsContext;
    const { participants } = participantsContext;
    const { payments } = paymentsContext;

    return registrations
      .map((registration) => {
        const product = products.find((p) => p.id === registration.productId);
        const participant = participants.find((p) => p.id === registration.participantId);
        const season = product ? seasons.find((s) => s.id === product.seasonId) : undefined;

        // Skip if any required relations are missing (defensive, no non-null assertion)
        if (!product || !participant || !season) return null;

        const registrationPayments = payments.filter((p) => p.registrationId === registration.id);

        // Single source of truth: all financial math goes through calcRegistrationFinancials.
        // It handles approved discounts, payment-doc aggregation, and the legacy fallback
        // (registration.paidAmount) for records that predate the payment-document system.
        const { effectiveRequired: effectiveRequiredAmount, totalPaid: actualPaidAmount } =
          calcRegistrationFinancials(registration, registrationPayments);

        const paymentStatus = registrationsContext.calculatePaymentStatus({
          ...registration,
          paidAmount: actualPaidAmount,
        });

        return {
          ...registration,
          paidAmount: actualPaidAmount,
          effectiveRequiredAmount,
          product,
          participant,
          season,
          paymentStatus,
          payments: registrationPayments,
        };
      })
      .filter(Boolean) as ReturnType<CombinedDataContextType['getAllRegistrationsWithDetails']>;
  }, [
    registrationsContext.registrations,
    registrationsContext.calculatePaymentStatus,
    productsContext.products,
    seasonsContext.seasons,
    participantsContext.participants,
    paymentsContext.payments,
  ]);

  // Fixed meeting calculation: counts only actual meeting days, not approximate weeks
  const calculateMeetingProgress = (product: Product) => {
    if (!product.startDate || !product.meetingsCount || !product.daysOfWeek?.length) {
      return { current: 0, total: product.meetingsCount || 0 };
    }

    const startDate = new Date(product.startDate);
    startDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today < startDate) return { current: 0, total: product.meetingsCount };

    const activityDays = new Set(product.daysOfWeek.map((d) => DAY_MAP[d]).filter((n) => n !== undefined));

    let meetingCount = 0;
    const current = new Date(startDate);

    while (current <= today && meetingCount < product.meetingsCount) {
      if (activityDays.has(current.getDay())) meetingCount++;
      current.setDate(current.getDate() + 1);
    }

    return { current: meetingCount, total: product.meetingsCount };
  };

  const getDailyActivities = (date: string) => {
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    const dayOfWeek = DAY_NAMES[selectedDate.getDay()];

    const activeProducts = productsContext.products.filter((product) => {
      const start = new Date(product.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(product.endDate);
      end.setHours(23, 59, 59, 999);
      return selectedDate >= start && selectedDate <= end && product.daysOfWeek?.includes(dayOfWeek);
    });

    return activeProducts.map((product) => {
      const productRegistrations = registrationsContext.getRegistrationsByProduct(product.id);
      const progress = calculateMeetingProgress(product);
      return {
        product,
        startTime: product.startTime ?? '',
        numParticipants: productRegistrations.length,
        currentMeetingNumber: progress.current,
        totalMeetings: progress.total,
      };
    });
  };

  const contextValue: CombinedDataContextType = {
    ...seasonsContext,
    ...poolsContext,
    ...productsContext,
    ...participantsContext,
    ...registrationsContext,
    ...paymentsContext,
    ...healthDeclarationsContext,
    ...leadsContext,
    getAllRegistrationsWithDetails,
    calculateMeetingProgress,
    getDailyActivities,
  };

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SeasonsProvider>
    <PoolsProvider>
      <ProductsProvider>
        <ParticipantsProvider>
          <RegistrationsProvider>
            <PaymentsProvider>
              <HealthDeclarationsProvider>
                <LeadsProvider>
                  <DataConsumer>{children}</DataConsumer>
                </LeadsProvider>
              </HealthDeclarationsProvider>
            </PaymentsProvider>
          </RegistrationsProvider>
        </ParticipantsProvider>
      </ProductsProvider>
    </PoolsProvider>
  </SeasonsProvider>
);
