
import { useEffect, useMemo, useState } from 'react';
import { Product } from '@/types';
import { useData } from '@/context/DataContext';

interface ProductPageSummary {
  registrationsCount: number;
  totalExpected: number;
  totalPaid: number;
}

export function useProductPageData(seasonId: string | undefined, poolId?: string | undefined) {
  const {
    seasons,
    pools,
    products,
    getProductsBySeason,
    getProductsByPool,
    getAllRegistrationsWithDetails,
  } = useData();

  const [currentSeason, setCurrentSeason] = useState(seasons.find(s => s.id === seasonId));
  const [seasonProducts, setSeasonProducts] = useState<Product[]>([]);

  // Load season, pool, and products data
  useEffect(() => {
    if (poolId) {
      // If poolId is provided, get products by pool
      const productsInPool = getProductsByPool(poolId);
      setSeasonProducts(productsInPool);
      
      // Still set currentSeason if seasonId is provided
      if (seasonId) {
        const season = seasons.find(s => s.id === seasonId);
        setCurrentSeason(season);
      }
    } else if (seasonId) {
      // If only seasonId is provided, get products by season
      const season = seasons.find(s => s.id === seasonId);
      setCurrentSeason(season);
      
      const productsForSeason = getProductsBySeason(seasonId);
      setSeasonProducts(productsForSeason);
    }
  }, [seasonId, poolId, seasons, pools, getProductsBySeason, getProductsByPool]);

  // Calculate season summary data — use getAllRegistrationsWithDetails() so the numbers
  // are IDENTICAL to those shown in Dashboard and Report (single source of truth).
  // useMemo avoids the setState + useEffect pattern which caused stale data when
  // getAllRegistrationsWithDetails changed reference on every render.
  const summaryData = useMemo<ProductPageSummary>(() => {
    if (seasonProducts.length === 0) {
      return { registrationsCount: 0, totalExpected: 0, totalPaid: 0 };
    }
    const productIds = new Set(seasonProducts.map(p => p.id));
    const relevant = getAllRegistrationsWithDetails().filter(r => productIds.has(r.productId));
    return {
      registrationsCount: relevant.length,
      totalExpected: relevant.reduce((sum, r) => sum + r.effectiveRequiredAmount, 0),
      totalPaid:     relevant.reduce((sum, r) => sum + r.paidAmount, 0),
    };
  }, [seasonProducts, getAllRegistrationsWithDetails]);

  // Format date for display — Israeli format DD/MM/YYYY
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('he-IL');
    } catch (e) {
      return dateString;
    }
  };

  return {
    currentSeason,
    seasonProducts,
    summaryData,
    formatDate,
    setSeasonProducts
  };
}
