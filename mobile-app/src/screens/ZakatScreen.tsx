import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { apiService } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Typography } from '../components/Typography';
import { Icon } from '../components/Icon';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProgressBar } from '../components/ProgressBar';
import { Skeleton } from '../components/Skeleton';
import { theme } from '../theme';
import { formatCurrency } from '../utils/analytics';

const { width } = Dimensions.get('window');

interface ZakatCalculation {
  totalAssets: number;
  totalCashAndBank: number;
  nisabValue: number;
  zakatDue: number;
  isZakatDue: boolean;
  date?: string;
}

export const ZakatScreen: React.FC = () => {
  const [netWorth, setNetWorth] = useState<any>(null);
  const [zakatCalculation, setZakatCalculation] = useState<ZakatCalculation | null>(null);
  const [history, setHistory] = useState<ZakatCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [nwRes, historyRes] = await Promise.all([
        apiService.zakat.getNetWorth(),
        apiService.zakat.getHistory(),
      ]);
      setNetWorth(nwRes.data);
      setHistory(historyRes.data);
      
      if (historyRes.data.length > 0) {
        setZakatCalculation(historyRes.data[0]);
      }
    } catch (error) {
      console.error('Failed to load zakat data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const response = await apiService.zakat.calculate();
      setZakatCalculation(response.data);
      Alert.alert('Zakat Calculated', 'Your zakat for this year has been saved.');
      loadData(); 
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to calculate');
    } finally {
      setCalculating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const progress = zakatCalculation && netWorth
    ? Math.min(netWorth.netWorth / zakatCalculation.nisabValue, 1) 
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Typography variant="h2" style={styles.header}>Zakat Portfolio</Typography>

        <Card style={styles.mainCard} variant="flat">
          <View style={styles.statusHeader}>
             <View>
                <Typography variant="label" color={theme.colors.textSecondary}>Current Status</Typography>
                <Typography variant="h3">
                  {zakatCalculation?.isZakatDue ? 'Zakat Required' : 'Growth Phase'}
                </Typography>
             </View>
             <Icon name="Crown" size={32} color={zakatCalculation?.isZakatDue ? theme.colors.primary : theme.colors.textTertiary} />
          </View>

          <View style={styles.progressBox}>
             <View style={styles.progressText}>
                <Typography variant="caption">Assets: {formatCurrency(netWorth?.netWorth || 0)}</Typography>
                <Typography variant="caption" color={theme.colors.primary}>Nisab: {formatCurrency(zakatCalculation?.nisabValue || 0)}</Typography>
             </View>
             <ProgressBar progress={progress} color={theme.colors.primary} />
          </View>
        </Card>

        {zakatCalculation?.isZakatDue && (
          <Card style={styles.dueCard}>
            <Typography variant="body" color="#FFFFFF">Estimated Zakat Due</Typography>
            <Typography variant="h1" color="#FFFFFF">{formatCurrency(zakatCalculation.zakatDue)}</Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.7)">Based on 2.5% of total wealth</Typography>
          </Card>
        )}

        <Typography variant="h3" style={styles.sectionTitle}>Asset Distribution</Typography>
        <Card variant="outlined" style={styles.assetCard}>
           <View style={styles.assetRow}>
              <View style={styles.assetInfo}>
                 <Icon name="Wallet" size={20} color={theme.colors.primary} />
                 <Typography style={{ marginLeft: 12 }}>Cash & Bank</Typography>
              </View>
              <Typography variant="h4">{formatCurrency(netWorth?.netWorth || 0)}</Typography>
           </View>
        </Card>

        <Typography variant="h3" style={styles.sectionTitle}>History</Typography>
        {history.length > 0 ? (
          <Card variant="flat" style={styles.historyCard}>
            {history.slice(0, 3).map((h, i) => (
              <View key={i} style={[styles.historyRow, i !== 0 && styles.historyBorder]}>
                <Typography variant="body">{new Date(h.date || '').getFullYear()}</Typography>
                <Typography variant="h4" color={theme.colors.success}>{formatCurrency(h.zakatDue)}</Typography>
              </View>
            ))}
          </Card>
        ) : (
          <Typography variant="body" color={theme.colors.textTertiary} align="center">No history yet</Typography>
        )}

        <Button 
          title="Calculate Now" 
          onPress={handleCalculate} 
          loading={calculating} 
          style={styles.calcButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { padding: theme.spacing.lg },
  header: { marginBottom: theme.spacing.xl },
  mainCard: { padding: theme.spacing.lg, marginBottom: theme.spacing.lg, borderBottomWidth: 4, borderBottomColor: theme.colors.primary + '20' },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xl },
  progressBox: { marginTop: theme.spacing.sm },
  progressText: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dueCard: { backgroundColor: theme.colors.primary, padding: theme.spacing.xl, borderRadius: 24, marginBottom: theme.spacing.xl, alignItems: 'center' },
  sectionTitle: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.md },
  assetCard: { padding: theme.spacing.md, marginBottom: theme.spacing.md },
  assetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  assetInfo: { flexDirection: 'row', alignItems: 'center' },
  historyCard: { padding: theme.spacing.md },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  historyBorder: { borderTopWidth: 1, borderTopColor: theme.colors.divider },
  calcButton: { marginTop: 40, height: 56 }
});
