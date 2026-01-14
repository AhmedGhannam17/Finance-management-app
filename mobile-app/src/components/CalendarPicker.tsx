import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { theme } from '../theme';
import { Typography } from './Typography';
import { Icon } from './Icon';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CalendarPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - theme.spacing.xl * 2) / 7;

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(month, year);
    const firstDay = firstDayOfMonth(month, year);
    
    const calendarDays = [];
    
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push({ id: `prev-${i}`, day: '', fullDate: '' });
    }
    
    // Days of current month
    for (let i = 1; i <= days; i++) {
        // Correctly format date manually to avoid timezone issues with toISOString()
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        calendarDays.push({
            id: `curr-${i}`,
            day: i,
            fullDate: dateString,
        });
    }

    return calendarDays;
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const handleSelect = (date: string) => {
    if (!date) return;
    onSelectDate(date);
    onClose();
  };

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
               <Typography variant="h3">
                {currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </Typography>
              <View style={styles.controls}>
                <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowBtn}>
                  <Icon name="ChevronLeft" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowBtn}>
                  <Icon name="ChevronRight" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Icon name="X" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {weekDays.map((day) => (
              <Typography key={day} variant="caption" style={styles.weekDay} color={theme.colors.textTertiary}>
                {day}
              </Typography>
            ))}
          </View>

          <FlatList
            data={generateDays()}
            keyExtractor={(item) => item.id}
            numColumns={7}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.dayItem,
                  selectedDate === item.fullDate && styles.selectedDay
                ]}
                onPress={() => handleSelect(item.fullDate)}
                disabled={!item.day}
              >
                <Typography
                    variant="bodySmall"
                    color={
                        selectedDate === item.fullDate
                        ? '#fff'
                        : !item.day ? 'transparent' : theme.colors.text
                    }
                >
                  {item.day}
                </Typography>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.calendarGrid}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: theme.spacing.lg,
    maxHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  controls: {
    flexDirection: 'row',
  },
  arrowBtn: {
    padding: 4,
    marginLeft: 8,
  },
  closeBtn: {
    padding: 4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.sm,
  },
  weekDay: {
    width: ITEM_WIDTH,
    textAlign: 'center',
  },
  calendarGrid: {
    paddingBottom: theme.spacing.md,
  },
  dayItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderRadius: ITEM_WIDTH / 2,
  },
  selectedDay: {
    backgroundColor: theme.colors.primary,
  },
});
