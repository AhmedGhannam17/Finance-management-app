import React from 'react';
import { Dimensions, View, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { theme } from '../../theme';
import { Typography } from '../Typography';

interface AllocationData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface AllocationChartProps {
  data: AllocationData[];
  title?: string;
}

const screenWidth = Dimensions.get('window').width;

export const AllocationChart: React.FC<AllocationChartProps> = ({ data, title }) => {
  return (
    <View style={styles.container}>
      {title && (
        <Typography variant="h4" style={styles.title}>
          {title}
        </Typography>
      )}
      <PieChart
        data={data}
        width={screenWidth - theme.spacing.xl * 2}
        height={200}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 0]}
        absolute
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.md,
  },
  title: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
});
