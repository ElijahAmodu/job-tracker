import { Document, Page, Text, StyleSheet } from "@react-pdf/renderer";
import { Profile } from "@/lib/types";

const styles = StyleSheet.create({
  page: { padding: 50, fontSize: 11, fontFamily: "Helvetica", lineHeight: 1.5 },
  header: { marginBottom: 20 },
  name: { fontSize: 14, fontWeight: 700 },
  contact: { fontSize: 9, color: "#444", marginTop: 2 },
  meta: { marginBottom: 16, fontSize: 10, color: "#444" },
  paragraph: { marginBottom: 10 },
});

export function CoverLetterDocument({
  profile,
  company,
  roleTitle,
  body,
}: {
  profile: Profile;
  company: string;
  roleTitle: string;
  body: string;
}) {
  const paragraphs = body.split("\n").filter((p) => p.trim().length > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{profile.full_name}</Text>
        <Text style={styles.contact}>
          {profile.email}
          {profile.phone ? ` · ${profile.phone}` : ""}
        </Text>
        <Text style={styles.meta}>
          {new Date().toLocaleDateString()} — Re: {roleTitle} at {company}
        </Text>
        {paragraphs.map((p, i) => (
          <Text key={i} style={styles.paragraph}>
            {p}
          </Text>
        ))}
      </Page>
    </Document>
  );
}
