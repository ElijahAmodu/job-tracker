import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Profile, ResumeDraft } from "../../lib/types";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  name: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  contact: { fontSize: 9, color: "#444", marginBottom: 12 },
  summary: { marginBottom: 14, lineHeight: 1.4 },
  sectionHeading: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 10,
    marginBottom: 6,
    borderBottom: "1pt solid #ccc",
    paddingBottom: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  itemTitle: { fontWeight: 700 },
  itemDates: { color: "#666" },
  bullet: { marginLeft: 10, marginBottom: 2, lineHeight: 1.3 },
});

// Renders the tailored resume as a downloadable PDF entirely client-side —
// no third-party PDF service, no cost, no data leaving the browser at export time.
export function ResumeDocument({
  profile,
  resume,
}: {
  profile: Profile;
  resume: ResumeDraft;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{profile.full_name}</Text>
        <Text style={styles.contact}>
          {profile.email}
          {profile.phone ? ` · ${profile.phone}` : ""}
          {profile.location ? ` · ${profile.location}` : ""}
          {profile.links.portfolio ? ` · ${profile.links.portfolio}` : ""}
          {profile.links.github ? ` · ${profile.links.github}` : ""}
        </Text>

        <Text style={styles.summary}>{resume.summary}</Text>

        {resume.sections.map((section, i) => (
          <View key={i}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            {section.items.map((item, j) => (
              <View key={j} style={{ marginBottom: 8 }}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {item.title}
                    {item.organization ? ` — ${item.organization}` : ""}
                  </Text>
                  {item.dates && (
                    <Text style={styles.itemDates}>{item.dates}</Text>
                  )}
                </View>
                {item.bullets.map((b, k) => (
                  <Text key={k} style={styles.bullet}>
                    • {b}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}
