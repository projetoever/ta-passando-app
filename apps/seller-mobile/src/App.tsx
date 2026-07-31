import { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { canActivateRealRoute, locationPolicy } from "./location-policy";

const colors = {
  ink: "#103F32",
  inkSoft: "#1D5445",
  orange: "#F05A22",
  cream: "#FBF8F1",
  paper: "#FFFDF8",
  line: "#E5DED1",
  muted: "#6F716C",
  greenSoft: "#DDEBCE",
  orangeSoft: "#FFE4CF",
};

const requests = [
  { name: "Marina A.", item: "30 ovos vermelhos", distance: "450 m" },
  { name: "Carlos R.", item: "2 bandejas de ovos", distance: "780 m" },
];

export default function App() {
  const [simulationActive, setSimulationActive] = useState(false);
  const realRouteAvailable = canActivateRealRoute({
    sellerApproved: false,
    consentAccepted: false,
    gpsCapabilityEnabled: locationPolicy.foundationGpsEnabled,
  });

  const toggleSimulation = () => {
    if (realRouteAvailable) return;
    setSimulationActive((active) => !active);
    Alert.alert(
      "Modo de demonstração",
      "Nenhuma localização real está sendo coletada nesta fundação técnica.",
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandMark}><Text style={styles.brandPin}>⌖</Text></View>
          <View style={styles.headerCopy}>
            <Text style={styles.brand}>TE Vi na TV</Text>
            <Text style={styles.pilot}>VENDEDOR · PILOTO</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>OZ</Text></View>
        </View>

        <Text style={styles.greeting}>Bom dia, Zé!</Text>
        <Text style={styles.subtitle}>Seu ponto de partida para a rota de hoje.</Text>

        <View style={[styles.routeCard, simulationActive && styles.routeCardActive]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, simulationActive && styles.statusDotActive]} />
            <Text style={styles.statusLabel}>
              {simulationActive ? "Simulação em andamento" : "Fora de rota"}
            </Text>
          </View>
          <Text style={styles.routeTitle}>
            {simulationActive ? "Rota demonstrativa ativa" : "Sua localização está desligada"}
          </Text>
          <Text style={styles.routeDescription}>
            O GPS real só será liberado após aprovação do vendedor, consentimento e conexão segura com a API.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={[styles.primaryButton, simulationActive && styles.stopButton]}
            onPress={toggleSimulation}
          >
            <Text style={styles.primaryButtonText}>
              {simulationActive ? "Encerrar demonstração" : "Testar Modo Rota"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeIcon}>✓</Text>
          <View style={styles.noticeCopy}>
            <Text style={styles.noticeTitle}>Privacidade desde a fundação</Text>
            <Text style={styles.noticeText}>GPS desligado · dados simulados · nenhum pedido real</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Solicitações próximas</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>{requests.length}</Text></View>
        </View>

        {requests.map((request) => (
          <View style={styles.requestCard} key={request.name}>
            <View style={styles.requestTop}>
              <View style={styles.requestAvatar}><Text style={styles.requestAvatarText}>{request.name[0]}</Text></View>
              <View style={styles.requestCopy}>
                <Text style={styles.requestName}>{request.name}</Text>
                <Text style={styles.requestItem}>{request.item}</Text>
              </View>
              <Text style={styles.distance}>{request.distance}</Text>
            </View>
            <View style={styles.requestActions}>
              <Pressable style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Recusar</Text></Pressable>
              <Pressable style={styles.acceptButton}><Text style={styles.acceptButtonText}>Aceitar simulação</Text></Pressable>
            </View>
          </View>
        ))}

        <Text style={styles.footer}>Fundação técnica 0.1.0 · Santo André, SP</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  page: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 34 },
  brandMark: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.ink },
  brandPin: { color: colors.paper, fontSize: 25, fontWeight: "800" },
  headerCopy: { flex: 1, marginLeft: 11 },
  brand: { color: colors.ink, fontSize: 22, fontWeight: "800", letterSpacing: -0.7 },
  pilot: { color: colors.orange, fontSize: 10, fontWeight: "800", letterSpacing: 1.1, marginTop: 2 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: colors.greenSoft },
  avatarText: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  greeting: { color: colors.ink, fontSize: 31, lineHeight: 37, fontWeight: "800", letterSpacing: -1.1 },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 5, marginBottom: 20 },
  routeCard: { borderWidth: 1, borderColor: colors.line, borderRadius: 23, padding: 20, backgroundColor: colors.paper },
  routeCardActive: { borderColor: colors.inkSoft, backgroundColor: "#F2F8EC" },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#A9AAA5", marginRight: 8 },
  statusDotActive: { backgroundColor: "#31C450" },
  statusLabel: { color: colors.inkSoft, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.8 },
  routeTitle: { color: colors.ink, fontSize: 23, lineHeight: 29, fontWeight: "800", marginTop: 13 },
  routeDescription: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 7 },
  primaryButton: { minHeight: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.orange, marginTop: 18 },
  stopButton: { backgroundColor: colors.ink },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  notice: { flexDirection: "row", alignItems: "center", borderRadius: 17, padding: 15, backgroundColor: colors.orangeSoft, marginTop: 14 },
  noticeIcon: { width: 31, height: 31, borderRadius: 16, textAlign: "center", textAlignVertical: "center", backgroundColor: colors.paper, color: colors.orange, fontSize: 17, fontWeight: "800" },
  noticeCopy: { flex: 1, marginLeft: 11 },
  noticeTitle: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  noticeText: { color: colors.muted, fontSize: 12, marginTop: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginTop: 31, marginBottom: 12 },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: "800", letterSpacing: -0.5 },
  badge: { minWidth: 25, height: 25, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.orange, marginLeft: 9 },
  badgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  requestCard: { borderWidth: 1, borderColor: colors.line, borderRadius: 19, padding: 16, backgroundColor: colors.paper, marginBottom: 12 },
  requestTop: { flexDirection: "row", alignItems: "center" },
  requestAvatar: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.greenSoft },
  requestAvatarText: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  requestCopy: { flex: 1, marginLeft: 11 },
  requestName: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  requestItem: { color: colors.muted, fontSize: 13, marginTop: 2 },
  distance: { color: colors.orange, fontSize: 12, fontWeight: "800" },
  requestActions: { flexDirection: "row", marginTop: 15 },
  secondaryButton: { flex: 0.7, minHeight: 43, borderWidth: 1, borderColor: colors.line, borderRadius: 13, alignItems: "center", justifyContent: "center", marginRight: 8 },
  secondaryButtonText: { color: colors.muted, fontSize: 13, fontWeight: "700" },
  acceptButton: { flex: 1.3, minHeight: 43, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.ink },
  acceptButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  footer: { color: colors.muted, fontSize: 11, textAlign: "center", marginTop: 18 },
});
