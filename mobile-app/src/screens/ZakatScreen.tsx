import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Typography } from '../components/Typography';
import { Icon } from '../components/Icon';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Input } from '../components/Input';
import { useTheme } from '../context/ThemeContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { formatCurrency } from '../utils/analytics';
import { storageService } from '../services/storage';

const NISAB_GOLD_GRAMS = 87.48;
const NISAB_SILVER_GRAMS = 612.36;

export const ZakatScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  // Market Prices
  const [goldPrice, setGoldPrice] = useState('6000');
  const [silverPrice, setSilverPrice] = useState('80');
  const [nisabType, setNisabType] = useState<'gold' | 'silver'>('silver');

  // Assets
  const [useAutoCash, setUseAutoCash] = useState(true);
  const [manualCash, setManualCash] = useState('0');
  const [goldWeight, setGoldWeight] = useState('0');
  const [silverWeight, setSilverWeight] = useState('0');
  const [investments, setInvestments] = useState('0');
  const [otherAssets, setOtherAssets] = useState('0');
  
  // Liabilities
  const [debts, setDebts] = useState('0');
  
  const [autoCashValue, setAutoCashValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const nwRes = await apiService.zakat.getNetWorth();
      setAutoCashValue(nwRes.data.netWorth);
      
      // Load saved prices
      const prices = await storageService.getZakatPrices();
      setGoldPrice(prices.goldPrice);
      setSilverPrice(prices.silverPrice);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totals = useMemo(() => {
    const cash = useAutoCash ? autoCashValue : (parseFloat(manualCash) || 0);
    const gold = (parseFloat(goldWeight) || 0) * (parseFloat(goldPrice) || 0);
    const silver = (parseFloat(silverWeight) || 0) * (parseFloat(silverPrice) || 0);
    const inv = parseFloat(investments) || 0;
    const other = parseFloat(otherAssets) || 0;
    const liab = parseFloat(debts) || 0;

    const totalAssets = cash + gold + silver + inv + other;
    const netAssets = Math.max(0, totalAssets - liab);
    
    const currentNisab = nisabType === 'gold' 
      ? NISAB_GOLD_GRAMS * (parseFloat(goldPrice) || 0)
      : NISAB_SILVER_GRAMS * (parseFloat(silverPrice) || 0);
    
    const zakatDue = netAssets >= currentNisab ? netAssets * 0.025 : 0;

    return {
      totalAssets,
      netAssets,
      nisab: currentNisab,
      zakatDue,
      isDue: netAssets >= currentNisab
    };
  }, [useAutoCash, autoCashValue, manualCash, goldWeight, silverWeight, goldPrice, silverPrice, investments, otherAssets, debts, nisabType]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSaveRecord = async () => {
    setSaving(true);
    try {
      const payload = {
        goldPrice: parseFloat(goldPrice),
        silverPrice: parseFloat(silverPrice),
        nisabType,
        manualCash: useAutoCash ? undefined : parseFloat(manualCash),
        goldWeight: parseFloat(goldWeight),
        silverWeight: parseFloat(silverWeight),
        investments: parseFloat(investments),
        debts: parseFloat(debts),
      };
      await apiService.zakat.calculate(payload);
      Alert.alert('Success', 'Zakat calculation saved to history.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader title="Zakat Calculator" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* Market Prices Section */}
        <Card style={styles.sectionCard}>
          <Typography variant="h4" style={styles.sectionTitle}>Market Prices (per gram)</Typography>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
               <Input 
                 label="Gold Price" 
                 value={goldPrice} 
                 onChangeText={(text) => {
                   setGoldPrice(text);
                   storageService.setZakatPrices(text, silverPrice);
                 }} 
                 keyboardType="numeric" 
               />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
               <Input 
                 label="Silver Price" 
                 value={silverPrice} 
                 onChangeText={(text) => {
                   setSilverPrice(text);
                   storageService.setZakatPrices(goldPrice, text);
                 }} 
                 keyboardType="numeric" 
               />
            </View>
          </View>
          
          <View style={[styles.row, { marginTop: 16, alignItems: 'center' }]}>
            <Typography style={{ flex: 1 }}>Nisab Threshold Based On:</Typography>
            <TouchableOpacity 
              style={[styles.toggleBtn, nisabType === 'silver' && styles.toggleActive]}
              onPress={() => setNisabType('silver')}
            >
              <Typography variant="caption" color={nisabType === 'silver' ? '#fff' : theme.colors.textSecondary}>Silver</Typography>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, nisabType === 'gold' && styles.toggleActive, { marginLeft: 8 }]}
              onPress={() => setNisabType('gold')}
            >
              <Typography variant="caption" color={nisabType === 'gold' ? '#fff' : theme.colors.textSecondary}>Gold</Typography>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Assets Section */}
        <Typography variant="h3" style={styles.groupTitle}>Your Assets</Typography>
        
        <Card style={styles.assetCard}>
           <View style={[styles.row, { alignItems: 'center', marginBottom: 12 }]}>
             <Typography style={{ flex: 1 }} variant="h4">Cash & Bank</Typography>
             <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginRight: 8 }}>Use App Balance</Typography>
             <Switch value={useAutoCash} onValueChange={setUseAutoCash} trackColor={{ true: theme.colors.primary }} />
           </View>
           
           {useAutoCash ? (
             <View style={styles.autoValueBox}>
               <Typography variant="h3" color={theme.colors.primary}>{formatCurrency(autoCashValue)}</Typography>
               <Typography variant="caption" color={theme.colors.textTertiary}>Synced from your accounts</Typography>
             </View>
           ) : (
             <Input placeholder="Enter total cash" value={manualCash} onChangeText={setManualCash} keyboardType="numeric" />
           )}
        </Card>

        <Card style={styles.assetCard}>
           <Typography variant="h4" style={{ marginBottom: 12 }}>Precious Metals (grams)</Typography>
           <View style={styles.row}>
             <View style={{ flex: 1, marginRight: 8 }}>
                <Input label="Gold (grams)" value={goldWeight} onChangeText={setGoldWeight} keyboardType="numeric" />
             </View>
             <View style={{ flex: 1, marginLeft: 8 }}>
                <Input label="Silver (grams)" value={silverWeight} onChangeText={setSilverWeight} keyboardType="numeric" />
             </View>
           </View>
        </Card>

        <Card style={styles.assetCard}>
           <Typography variant="h4" style={{ marginBottom: 12 }}>Investments & Others</Typography>
           <Input label="Investments / Stocks" value={investments} onChangeText={setInvestments} keyboardType="numeric" />
           <View style={{ height: 12 }} />
           <Input label="Other Assets" value={otherAssets} onChangeText={setOtherAssets} keyboardType="numeric" />
        </Card>

        {/* Liabilities Section */}
        <Typography variant="h3" style={styles.groupTitle}>Liabilities</Typography>
        <Card style={styles.assetCard}>
           <Input label="Debts / Short-term bills" value={debts} onChangeText={setDebts} keyboardType="numeric" />
           <Typography variant="caption" color={theme.colors.textTertiary} style={{ marginTop: 8 }}>
             Deduct debts that are due now or in the near future.
           </Typography>
        </Card>

        {/* Summary Breakdown */}
        <Typography variant="h3" style={styles.groupTitle}>Breakdown</Typography>
        <Card style={styles.summaryCard}>
           <View style={styles.summaryRow}>
             <Typography color={theme.colors.textSecondary}>Net Assets</Typography>
             <Typography variant="h4">{formatCurrency(totals.netAssets)}</Typography>
           </View>
           <View style={styles.summaryRow}>
             <Typography color={theme.colors.textSecondary}>Nisab ({nisabType})</Typography>
             <Typography variant="h4" color={theme.colors.primary}>{formatCurrency(totals.nisab)}</Typography>
           </View>
           <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12, marginTop: 4 }]}>
              <Typography variant="h4">Status</Typography>
              <Typography variant="h4" color={totals.isDue ? theme.colors.success : theme.colors.textTertiary}>
                {totals.isDue ? 'Zakat Required' : 'Below Nisab'}
              </Typography>
           </View>
        </Card>

        {totals.isDue && (
          <Card style={styles.dueCard}>
            <View style={{ alignItems: 'center' }}>
              <Typography variant="body" color="#FFFFFF">Annual Zakat Due (2.5%)</Typography>
              <Typography variant="h1" color="#FFFFFF" style={{ marginVertical: 8 }}>{formatCurrency(totals.zakatDue)}</Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.7)">Seek pure intentions and reward</Typography>
            </View>
          </Card>
        )}

        <Button 
          title="Save Calculation" 
          onPress={handleSaveRecord} 
          loading={saving} 
          style={styles.calcButton}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { padding: theme.spacing.lg },
  header: { marginBottom: theme.spacing.xl },
  sectionCard: { padding: theme.spacing.md, marginBottom: theme.spacing.lg },
  sectionTitle: { marginBottom: theme.spacing.md },
  groupTitle: { marginBottom: theme.spacing.md, marginTop: theme.spacing.lg },
  assetCard: { padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  row: { flexDirection: 'row' },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  toggleActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  autoValueBox: { padding: theme.spacing.md, backgroundColor: theme.colors.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.primary + '30', alignItems: 'center' },
  summaryCard: { padding: theme.spacing.md, marginBottom: theme.spacing.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dueCard: { backgroundColor: theme.colors.success, padding: theme.spacing.xl, borderRadius: 24, marginBottom: theme.spacing.xl },
  calcButton: { marginTop: 20, height: 56 }
});
