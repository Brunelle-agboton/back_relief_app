import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
  Alert,
  Pressable,
  Platform
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePractitioner } from "@/context/PractitionerContext";
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Calendar } from "react-native-calendars";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const { width } = Dimensions.get("window");
/* Helper format YYYY-MM-DD */
const isoKey = (d: Date) => d.toISOString().slice(0, 10);

/* Default time slots */
const DEFAULT_MORNING = ["09:00","09:20","09:40","10:00","10:20","10:40","11:20","11:40"];
const DEFAULT_AFTERNOON = ["13:00","13:20","13:40","14:00","14:20","14:40","15:00","15:20","15:40","16:00","16:20","16:40","17:00","17:20","17:40","18:00"];


const localIsoDateKey = (d: Date) => {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/* ----- utilitaires date ----- */
const isoDateKey = localIsoDateKey;
const dayShort = (d: Date) =>
  d.toLocaleDateString("fr-FR", { weekday: "short" }); // Lun, Mar...
const dayNumber = (d: Date) => d.getDate();
const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Mon=0 .. Sun=6
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};
const weekFrom = (anchor: Date) => {
  const start = startOfWeek(anchor);
  const days: Date[] = [];
  for (let i = 0; i < 6; i++) {
    // maquette montre Lun -> Sam (6 jours)
    const dd = new Date(start);
    dd.setDate(start.getDate() + i);
    days.push(dd);
  }
  return days;
};
const monthRangeLabel = (anchor: Date) => {
  const start = startOfWeek(anchor);
  const end = new Date(start);
  end.setDate(start.getDate() + 5);
  const startLabel = start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  const endLabel = end.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: start.getFullYear() === end.getFullYear() ? undefined : "numeric" });
  return `Du ${startLabel} au ${endLabel}`;
};

/* group appointments by YYYY-MM-DD */
const groupByDate = (appointments: any[]) =>
  (appointments || []).reduce((acc: Record<string, any[]>, a: any) => {
    const key = localIsoDateKey(new Date(a.start_at));
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    acc[key].sort((x: any, y: any) => new Date(x.start_at).getTime() - new Date(y.start_at).getTime());
    return acc;
  }, {});

/* convert ISO strings to minutes since midnight */
const minutesSinceMidnight = (iso: string) => {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
};

/* visual constants for timeline */
const TIMELINE_START_HOUR = 9;
const TIMELINE_END_HOUR = 22;
const SLOT_HEIGHT = 56; // pixels per hour

const PlanningView = () => {
  const { profile, isLoading: ctxLoading } = usePractitioner();
  const router = useRouter();

  const [weekAnchor, setWeekAnchor] = useState<Date>(new Date()); // anchor date to compute week
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => isoDateKey(new Date()));

  useEffect(() => {
    // keep selected date in the initially visible week
    const currentWeek = weekFrom(weekAnchor).map(d => isoDateKey(d));
    if (!currentWeek.includes(selectedDateKey)) {
      setSelectedDateKey(isoDateKey(weekFrom(weekAnchor)[0]));
    }
  }, [weekAnchor]);

  const days = useMemo(() => weekFrom(weekAnchor), [weekAnchor]);
  const grouped = useMemo(() => groupByDate(profile?.appointments ?? []), [profile?.appointments]);

  const appointmentsForSelected = grouped[selectedDateKey] || [];

  const prevWeek = () => {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() - 7);
    setWeekAnchor(d);
    // keep same weekday selected if possible
    const targetWeek = weekFrom(d);
    const old = new Date(selectedDateKey);
    const weekdayIndex = (old.getDay() + 6) % 7; // 0..6
    const candidate = targetWeek[Math.min(weekdayIndex, targetWeek.length - 1)];
    setSelectedDateKey(isoDateKey(candidate));
  };
  const nextWeek = () => {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() + 7);
    setWeekAnchor(d);
    const targetWeek = weekFrom(d);
    const old = new Date(selectedDateKey);
    const weekdayIndex = (old.getDay() + 6) % 7;
    const candidate = targetWeek[Math.min(weekdayIndex, targetWeek.length - 1)];
    setSelectedDateKey(isoDateKey(candidate));
  };

  

  /* render appointment block sized by duration */
  const renderAppointmentBlock = (app: any) => {
    // compute top offset and height in px relative to TIMELINE_START_HOUR
    const startMin = minutesSinceMidnight(app.start_at);
    const endMin = minutesSinceMidnight(app.end_at);
    const startOffsetMin = Math.max(0, startMin - TIMELINE_START_HOUR * 60);
    const durationMin = Math.max(15, endMin - startMin); // at least 15 min
    const top = (startOffsetMin / 60) * SLOT_HEIGHT;
    const height = (durationMin / 60) * SLOT_HEIGHT;

    const backgroundColor = app.patient?.role === 'user' ? '#CDFBE2' : '#1662A9';

    return (
      <View key={app.id} style={[styles.apptAbsolute, { top, height }]}>
        <View style={[styles.apptCard, { backgroundColor }]}>
          <View style={styles.timeChip}>
            <Text style={styles.apptTime}>{new Date(app.start_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</Text>
          </View>
          <Text style={styles.apptTitle}>{app.patient?.userName || "Rendez-vous"}</Text>
        </View>
      </View>
    );
  };

  /* timeline rows (hours) */
  const hours = [];
  for (let h = TIMELINE_START_HOUR; h <= TIMELINE_END_HOUR; h++) hours.push(h);

  return (
    <View style={{flex: 1}}>
      {/* week pill with chevrons */}
      <View style={styles.weekPillRow}>
        <Pressable onPress={prevWeek} style={styles.chevBtn}><Ionicons name="chevron-back" size={20} color="#374151" /></Pressable>
        <View style={styles.weekPill}>
          <Text style={styles.weekPillText}>{monthRangeLabel(weekAnchor)}</Text>
        </View>
        <Pressable onPress={nextWeek} style={styles.chevBtn}><Ionicons name="chevron-forward" size={20} color="#374151" /></Pressable>
      </View>

      {/* days strip (Lu..Sa) */}
      <View style={styles.daysStrip}>
        {days.map(d => {
          const key = isoDateKey(d);
          const isSelected = key === selectedDateKey;
          const hasAppts = Array.isArray(grouped[key]) && grouped[key].length > 0;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.dayCell, isSelected && styles.dayCellActive]}
              onPress={() => setSelectedDateKey(key)}
              accessibilityLabel={`Sélectionner ${d.toLocaleDateString("fr-FR")}`}
            >
              <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
                <Text style={[styles.dayShort, isSelected && styles.dayShortActive]}>{dayShort(d)}</Text>
                <Text style={[styles.dayNum, isSelected && styles.dayNumActive]}>{dayNumber(d)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* timeline + appointments */}
      <View style={styles.timelineWrap}>
        <View style={styles.hoursCol}>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={{ height: (TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1) * SLOT_HEIGHT }}>
              {hours.map((h) => (
                <View key={h} style={[styles.hourRow, { height: SLOT_HEIGHT }]}>
                  <Text style={styles.hourLabel}>{`${h}h`}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.slotsCol}>
          {(!appointmentsForSelected || appointmentsForSelected.length === 0) ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Aucun rendez-vous programmé</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
              <View style={{ height: (TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1) * SLOT_HEIGHT }}>
                {/* background stripes */}
                {hours.map((h, idx) => (
                  <View key={h} style={[styles.slotRow, { height: SLOT_HEIGHT, backgroundColor: idx % 2 === 0 ? "#FFF" : "#FBFBFB" }]} />
                ))}

                {/* absolute positioned appointments */}
                {appointmentsForSelected.map(renderAppointmentBlock)}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}


const AvailabilityView = () => {
    const { profile } = usePractitioner(); // expects context to expose existing availabilities
    const [selectedDates, setSelectedDates] = useState<Record<string, any>>({}); // object with keys YYYY-MM-DD for marking
    const [visibleMonthAnchor, setVisibleMonthAnchor] = useState<Date>(new Date());
    const [selectedWeekDay, setSelectedWeekDay] = useState<number>(new Date().getDay()); // 0..6; we'll use Mon-Fri
    const [morningSlots, setMorningSlots] = useState<string[]>(DEFAULT_MORNING);
    const [afternoonSlots, setAfternoonSlots] = useState<string[]>(DEFAULT_AFTERNOON);
    const [selectedSlotsByDate, setSelectedSlotsByDate] = useState<Record<string,{morning:string[],afternoon:string[]}>>({});

    /* Initialize from context availabilities (if structured by dates) */
    useEffect(() => {
        if (!profile?.availabilities || profile?.availabilities.length === 0) return;
        // Expect availabilities to have structure: [{ date: '2025-09-15', times: ['09:00', ...] }, ...]
        const selDates: Record<string, any> = {};
        const selSlots: Record<string,{morning:string[],afternoon:string[]}> = {};
        profile.availabilities.forEach((av: any) => {
            let key;
            if (av.date) {
                key = av.date;
            } else if (av.start_at) {
                key = isoKey(new Date(av.start_at));
            } else {
                return; // Skip this availability if no date is provided
            }
            selDates[key] = { selected: true, selectedColor: "#2B9D7E", textColor: "#fff" };
            const morning = (av.times || []).filter((t:string) => parseInt(t.split(":")[0],10) < 12);
            const afternoon = (av.times || []).filter((t:string) => parseInt(t.split(":")[0],10) >= 12);
            selSlots[key] = { morning, afternoon };
        });
        setSelectedDates(selDates);
        setSelectedSlotsByDate(selSlots);
    }, [profile?.availabilities]);

    /* Calendar marking object from selectedDates */
    const marked = useMemo(() => selectedDates, [selectedDates]);

    /* Toggle a date selection (multi-select) */
    const toggleDate = (day: { dateString: string; }) => {
        setSelectedDates(prev => {
            const key = day.dateString;
            const next = { ...prev };
            if (next[key]) {
                delete next[key];
                // also remove selected slots for that date
                setSelectedSlotsByDate(s => {
                    const copy = { ...s };
                    delete copy[key];
                    return copy;
                });
            } else {
                next[key] = { selected: true, selectedColor: "#E6FFF2", textColor: "#064E3B" };
                // initialize with default slots if none
                setSelectedSlotsByDate(s => ({ ...s, [key]: { morning: [], afternoon: [] } }));
            }
            return next;
        });
    };

    /* Week navigation (chevrons): shift month anchor by +/- 7 days */
    const prevWeek = () => {
        const d = new Date(visibleMonthAnchor);
        d.setDate(d.getDate() - 7);
        setVisibleMonthAnchor(d);
    };
    const nextWeek = () => {
        const d = new Date(visibleMonthAnchor);
        d.setDate(d.getDate() + 7);
        setVisibleMonthAnchor(d);
    };

    /* Helper: toggle slot for a given date & period */
    const toggleSlot = (dateKey: string, period: "morning" | "afternoon", time: string) => {
        setSelectedSlotsByDate(prev => {
            const cur = prev[dateKey] || { morning: [], afternoon: [] };
            const arr = [...(cur[period] as string[])];
            const idx = arr.indexOf(time);
            if (idx >= 0) arr.splice(idx, 1);
            else arr.push(time);
            return { ...prev, [dateKey]: { ...cur, [period]: arr } };
        });
        // ensure date selected
        if (!selectedDates[dateKey]) {
            setSelectedDates(s => ({ ...s, [dateKey]: { selected: true, selectedColor: "#E6FFF2", textColor: "#064E3B" } }));
        }
    };

    /* Add a dummy slot (you can replace by a modal to let user enter HH:MM) */
    const addDummySlot = (period: "morning" | "afternoon") => {
        // For demo: add 12:00 or first not existing slot
        const sample = period === "morning" ? "12:00" : "18:20";
        // Add to global default lists (so chips show)
        if (period === "morning") setMorningSlots(prev => (prev.includes(sample) ? prev : [...prev, sample]));
        else setAfternoonSlots(prev => (prev.includes(sample) ? prev : [...prev, sample]));
    };

    /* Confirm - send to API: build payload from selectedSlotsByDate */
    const onConfirm = async () => {
        if (!profile?.id) {
            Alert.alert("Erreur", "Profil introuvable.");
            return;
        }
        const payload = Object.entries(selectedSlotsByDate).map(([date, slots]) => ({
            practitionerId: profile.id,
            date,
            times: [...slots.morning, ...slots.afternoon].sort(),
        }));
        // if empty
        if (payload.length === 0) {
            Alert.alert("Aucune disponibilité", "Sélectionnez au moins un jour et un créneau.");
            return;
        }
        try {
            // Remplace par ton endpoint réel
            // await api.post('/practitioners/availabilities/batch', { items: payload });
            console.log("Payload to send:", payload);
            Alert.alert("OK", "Disponibilités enregistrées (simulé).");
        } catch (err) {
            Alert.alert("Erreur", "Impossible d'enregistrer les disponibilités.");
        }
    };

    /* Utility: compute week days to show (Mon..Sun but maquette uses Mon..Sat) */
    const weekDays = useMemo(() => {
        const start = new Date(visibleMonthAnchor);
        // start at Monday of the anchor's week
        const day = (start.getDay() + 6) % 7;
        start.setDate(start.getDate() - day);
        const arr = [];
        for (let i = 0; i < 6; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            arr.push(d);
        }
        return arr;
    }, [visibleMonthAnchor]);

    const selectedDateKey = Object.keys(selectedDates)[0] || isoKey(new Date()); // to show chips for single date; if multiple selected keep first for editing slots
    const slotsForCurrent = selectedSlotsByDate[selectedDateKey] || { morning: [], afternoon: [] };
    return (
        <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Vos disponibilités</Text>
        </View>

        {/* Calendar */}
        <View style={styles.calendarWrap}>
          <Calendar
            current={isoKey(visibleMonthAnchor)}
            onDayPress={(day) => toggleDate(day)}
            markedDates={marked}
            markingType={"multi-dot"}
            disableAllTouchEventsForDisabledDays={true}
            theme={{
               backgroundColor: "#EBF2F3",
               calendarBackground: "#EBF2F3",
     selectedDayBackgroundColor: "#D9FBEA",
        todayTextColor: "#064E3B",
              arrowColor: "#475569",
              monthTextColor: "#475569",
              textDayFontSize: 14,
              textMonthFontSize: 14,
            }}
            hideExtraDays={false}
            style={{ borderRadius: 12 }}
            onMonthChange={(m) => setVisibleMonthAnchor(new Date(m.dateString))}
          />
        </View>

        {/* Week strip with chevrons + pill */}
        <View style={styles.weekRow}>
          <TouchableOpacity onPress={() => { prevWeek(); }}>
            <Ionicons name="chevron-back" size={22} color="#475569" />
          </TouchableOpacity>

          <View style={styles.weekPillD}>
            <Text style={styles.weekPillText}>{`Du ${weekDays[0].toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} au ${weekDays[weekDays.length-1].toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`}</Text>
          </View>

          <TouchableOpacity onPress={() => { nextWeek(); }}>
            <Ionicons name="chevron-forward" size={22} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Days of week small pills */}
        <View style={styles.daysRow}>
          {weekDays.map((d) => {
            const key = isoKey(d);
            const isActive = key === selectedDateKey;
            const has = !!selectedDates[key];
            return (
              <TouchableOpacity
                key={key}
                style={[styles.dayBox, isActive && styles.dayBoxActive]}
                onPress={() => toggleDate({ dateString: key } as any)}
              >
                <Text style={[styles.dayBoxLabel, isActive && styles.dayBoxLabelActive]}>{d.toLocaleDateString("fr-FR",{weekday:"short"})}</Text>
                <Text style={[styles.dayBoxNumber, isActive && styles.dayBoxNumberActive]}>{d.getDate()}</Text>
                {has && <View style={[styles.dayDotD, isActive && styles.dayDotActiveD]} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section: Matin */}
        <View style={styles.hoursWrap}>
        <Text style={styles.sectionTitle}>Matin</Text>
<View style={styles.chipsRow}>
  
          {morningSlots.map((t) => {
            const selected = slotsForCurrent.morning.includes(t);
            return (
              <TouchableOpacity
                key={t}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => toggleSlot(selectedDateKey, "morning", t)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.addChip} onPress={() => addDummySlot("morning")}>
            <MaterialIcons name="add" size={18} color="#0B66A3" />
            <Text style={styles.addChipText}>Ajouter des horaires</Text>
          </TouchableOpacity>
</View>
        </View>

        {/* Section: Après-midi */}
        <View style={styles.hoursWrap}>
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Après-midi</Text>

        <View style={styles.chipsRow}>

          {afternoonSlots.map((t) => {
            const selected = slotsForCurrent.afternoon.includes(t);
            return (
              <TouchableOpacity
                key={t}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => toggleSlot(selectedDateKey, "afternoon", t)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.addChip} onPress={() => addDummySlot("afternoon")}>
            <MaterialIcons name="add" size={18} color="#0B66A3" />
            <Text style={styles.addChipText}>Ajouter des horaires</Text>
          </TouchableOpacity>
        </View>
        </View>

        {/* Confirm */}
        <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
          <Text style={styles.confirmText}>Confirmer les disponibilités</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
    )
}

const AgendaScreen = () => {
  const [activeTab, setActiveTab] = useState('planning');

  return (
    <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                style={[styles.tab, activeTab === 'planning' && styles.activeTab]}
                onPress={() => setActiveTab('planning')}
                >
                <Text style={[styles.tabText, activeTab === 'planning' && styles.activeTabText]}>Mon planning</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.tab, activeTab === 'availability' && styles.activeTab]}
                onPress={() => setActiveTab('availability')}
                >
                <Text style={[styles.tabText, activeTab === 'availability' && styles.activeTabText]}>Mes disponibilités</Text>
                </TouchableOpacity>
            </View>
            {activeTab === 'planning' ? <PlanningView /> : <AvailabilityView />}
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F8" },
  container: { flex: 1, paddingHorizontal: 10, paddingTop: 12 },
  scrollViewContainer: { paddingHorizontal: 10, paddingTop: 12 },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 4,
    borderColor: "#1662A9"
  },
  tabText: {
    color: '#1662A9',
  },
  activeTabText: {
    color: '#1662A9',
    fontWeight: 'bold',

  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
   marginBottom: 12 
  },
  weekPillRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 12, marginTop: 26 },
  chevBtn: { padding: 6 },
  weekPill: { backgroundColor: "#F3F4F6", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, maxWidth: width - 120 },
  weekPillText: { color: "#374151", fontWeight: "600", textAlign: "center" },

  daysStrip: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingHorizontal: 4 },
  dayCell: { width: (width - 32) / 6 - 4, alignItems: "center", paddingVertical: 8},
  dayCellActive: { borderBottomWidth: 2, borderBottomColor: "#0B66A3" },
  dayShort: { fontSize: 12, color: "#6B7280", textTransform: "capitalize" },
  dayShortActive: { color: "#0B66A3", fontWeight: "700" },
  dayNum: { marginLeft: 4, fontWeight: "700", color: "#111827" },
  dayNumActive: { color: "#0B66A3" },
  dayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#9CA3AF", marginTop: 6 },
  dayDotActive: { backgroundColor: "#0B66A3" },

  timelineWrap: { flexDirection: "row", marginTop: 12, flex: 1, marginBottom: 29 },
  hoursCol: { width: 56, paddingRight: 8 },
  hourRow: { justifyContent: "center", alignItems: "flex-end", paddingRight: 8 },
  hourLabel: { color: "#CBD5E1", fontSize: 12 },

  slotsCol: { flex: 1, borderRadius: 8, overflow: "hidden" },
  slotRow: { borderBottomWidth: 0.5, borderBottomColor: "#F1F5F9" },

  apptAbsolute: { position: "absolute", left: 8, right: 8, zIndex: 2},
  apptCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#1662A9", borderRadius: 20, borderWidth: 1, borderColor: "#1662A9",  paddingHorizontal: 10,},
  timeChip: { backgroundColor: '#fff', borderRadius: 26, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8 },
  apptTime: { fontSize: 12, color: "#064E3B", fontWeight: "700" },
  apptTitle: { fontSize: 14, fontWeight: "800", color: "#fff", marginTop: 0 },
  apptMeta: { fontSize: 12, color: "#175E4E", marginTop: 4 },

  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 24 },
  emptyText: { color: "#94A3B8", fontWeight: "600", fontSize: 16 },

/**----------------------------- */
 headerRow: { marginBottom: 8 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#0B2E20" },

  calendarWrap: {
    overflow: "hidden",
    backgroundColor: "#EBF2F3",
    paddingVertical: 6,
    borderRadius: 24,

    marginBottom: 14,
    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
  },

  weekRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12,},
  weekPillD: {  paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flex: 1, marginHorizontal: 12, alignItems: "center" },

  daysRow: { flexDirection: "row",  paddingVertical: 12, justifyContent: "space-between", marginBottom: 12 , backgroundColor: "#EBF2F3", },

  dayBox: { width: Platform.OS === "web" ? 80 : width / 6 - 16, alignItems: "center", paddingVertical: 8, borderRadius: 8, backgroundColor: "#fff", margin: 3 },
  dayBoxActive: { backgroundColor: "#E6FFF2", borderWidth: 1, borderColor: "#07A06B" },
  dayBoxLabel: { fontSize: 12, color: "#6B7280", textTransform: "capitalize" },
  dayBoxLabelActive: { color: "#064E3B", fontWeight: "700" },
  dayBoxNumber: { fontSize: 16, fontWeight: "700", marginTop: 6, color: "#111827" },
  dayBoxNumberActive: { color: "#064E3B" },
  dayDotD: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#9CA3AF", marginTop: 8 },
  dayDotActiveD: { backgroundColor: "#064E3B" },
  /* Hours */
  hoursWrap: {
    backgroundColor: "#EBF2F3",
    borderRadius: 24,
    padding: 12,
    marginTop: 10,
    marginBottom: 14,

    // shadow subtle
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionTitle: { fontWeight: "700", marginBottom: 8, color: "#0B2E20" },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 6 , backgroundColor: "#EBF2F3",},

  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 72,
    alignItems: "center",
  },
  chipSelected: {
    backgroundColor: "#DFFCEB",
    borderWidth: 1,
    borderColor: "#07A06B",
  },
  chipText: { color: "#374151", fontWeight: "600" },
  chipTextSelected: { color: "#064E3B" },

  addChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E6EEF5",
    minWidth: 160,
    marginRight: 8,
  },
  addChipText: { color: "#0B66A3", marginLeft: 8, fontWeight: "700" },

  confirmBtn: {
    marginTop: 18,
    backgroundColor: "#0B66A3",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    paddingHorizontal: 50,
    
  },
  confirmText: { color: "#fff", fontWeight: "800" },
});

export default AgendaScreen;