import React from 'react';
import { Dimensions, View, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { theme } from '../../theme';
import { Typography } from '../Typography';

interface BarData {
  labels: string[];
  datasets: {
    data: number[];
  }[];
}

interface CategoryBarChartProps {
  data: BarData;
  title?: string;
}

const screenWidth = Dimensions.get('window').width;

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ data, title }) => {
  if (data.labels.length === 0) return null;

  return (
    <View style={styles.container}>
      {title && (
        <Typography variant="h4" style={styles.title}>
          {title}
        </Typography>
      )}
      <BarChart
        data={data}
        width={screenWidth - theme.spacing.xl * 2}
        height={220}
        yAxisLabel="₹"
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: theme.colors.surface,
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726"
          }
        }}
        verticalLabelRotation={30}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
});
