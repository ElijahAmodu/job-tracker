// import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
// import { Profile, ResumeDraft } from "@/lib/types";

// // Styled to match the source resume: plain black/gray, bold caps name,
// // thin-bordered section headings, title+dates on one line, small gray
// // "Tech Stack:" line under each job's bullets.
// const styles = StyleSheet.create({
//   page: {
//     padding: 36,
//     fontSize: 9.5,
//     fontFamily: "Helvetica",
//     color: "#1a1a1a",
//   },
//   name: { fontSize: 16, fontWeight: 700, letterSpacing: 0.5 },
//   roleTitle: { fontSize: 10.5, color: "#333", marginTop: 1, marginBottom: 4 },
//   contact: { fontSize: 8.5, color: "#555", marginBottom: 10 },
//   summary: { marginBottom: 10, lineHeight: 1.4, fontSize: 9.5 },
//   sectionHeading: {
//     fontSize: 10,
//     fontWeight: 700,
//     marginTop: 9,
//     marginBottom: 5,
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//     borderBottom: "1pt solid #999",
//     paddingBottom: 2,
//   },
//   itemBlock: { marginBottom: 7 },
//   itemHeader: { flexDirection: "row", justifyContent: "space-between" },
//   itemTitle: { fontWeight: 700, fontSize: 9.5 },
//   itemDates: { color: "#555", fontSize: 8.5 },
//   bullet: { marginLeft: 10, marginTop: 2, lineHeight: 1.35 },
//   techStack: {
//     marginLeft: 10,
//     marginTop: 2,
//     fontSize: 8,
//     color: "#666",
//     fontStyle: "italic",
//   },
//   projectsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
//   projectCard: { width: "48%", marginBottom: 8 },
//   projectTitle: { fontWeight: 700, fontSize: 9.5, marginBottom: 2 },
//   projectDesc: { fontSize: 8.5, lineHeight: 1.35, color: "#333" },
//   projectTech: {
//     fontSize: 8,
//     color: "#666",
//     marginTop: 2,
//     fontStyle: "italic",
//   },
//   skillsLine: { fontSize: 8.5, lineHeight: 1.5, color: "#333" },
//   eduBlock: { marginBottom: 4 },
// });

// export function ResumeDocument({
//   profile,
//   resume,
// }: {
//   profile: Profile;
//   resume: ResumeDraft;
// }) {
//   const contactParts = [
//     profile.email,
//     profile.phone,
//     profile.location,
//     profile.links.linkedin,
//     profile.links.github,
//     profile.links.portfolio,
//   ].filter(Boolean);

//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         <Text style={styles.name}>{profile.full_name.toUpperCase()}</Text>
//         <Text style={styles.roleTitle}>{resume.role_title}</Text>
//         <Text style={styles.contact}>{contactParts.join(" | ")}</Text>

//         {resume.summary && (
//           <>
//             <Text style={styles.sectionHeading}>Professional Summary</Text>
//             <Text style={styles.summary}>{resume.summary}</Text>
//           </>
//         )}

//         {resume.experience.length > 0 && (
//           <View>
//             <Text style={styles.sectionHeading}>Work Experience</Text>
//             {resume.experience.map((job, i) => (
//               <View key={i} style={styles.itemBlock}>
//                 <View style={styles.itemHeader}>
//                   <Text style={styles.itemTitle}>
//                     {job.title}
//                     {job.organization ? ` — ${job.organization}` : ""}
//                   </Text>
//                   {job.dates && (
//                     <Text style={styles.itemDates}>{job.dates}</Text>
//                   )}
//                 </View>
//                 {job.bullets.map((b, k) => (
//                   <Text key={k} style={styles.bullet}>
//                     • {b}
//                   </Text>
//                 ))}
//                 {job.tech_stack.length > 0 && (
//                   <Text style={styles.techStack}>
//                     Tech Stack: {job.tech_stack.join(", ")}
//                   </Text>
//                 )}
//               </View>
//             ))}
//           </View>
//         )}

//         {resume.projects.length > 0 && (
//           <View>
//             <Text style={styles.sectionHeading}>Projects</Text>
//             <View style={styles.projectsGrid}>
//               {resume.projects.map((p, i) => (
//                 <View key={i} style={styles.projectCard}>
//                   <Text style={styles.projectTitle}>{p.title}</Text>
//                   <Text style={styles.projectDesc}>{p.description}</Text>
//                   {p.tech_stack.length > 0 && (
//                     <Text style={styles.projectTech}>
//                       {p.tech_stack.join(", ")}
//                     </Text>
//                   )}
//                 </View>
//               ))}
//             </View>
//           </View>
//         )}

//         {resume.skills.length > 0 && (
//           <View>
//             <Text style={styles.sectionHeading}>Technology Experience</Text>
//             <Text style={styles.skillsLine}>{resume.skills.join(" | ")}</Text>
//           </View>
//         )}

//         {resume.education.length > 0 && (
//           <View>
//             <Text style={styles.sectionHeading}>Education</Text>
//             {resume.education.map((edu, i) => (
//               <View key={i} style={styles.eduBlock}>
//                 <View style={styles.itemHeader}>
//                   <Text style={styles.itemTitle}>
//                     {edu.title}
//                     {edu.organization ? ` — ${edu.organization}` : ""}
//                   </Text>
//                   {edu.dates && (
//                     <Text style={styles.itemDates}>{edu.dates}</Text>
//                   )}
//                 </View>
//               </View>
//             ))}
//           </View>
//         )}
//       </Page>
//     </Document>
//   );
// }

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Profile, ResumeDraft } from "@/lib/types";

// Styled to match the source resume: plain black/gray, centered header block,
// thin-bordered section headings, title+dates on one line, small gray
// "Tech Stack:" line under each job's bullets. Spacing tightened throughout
// to fit one page — this holds for a typical 3-5 job / 2-3 project resume;
// a much longer history may still spill to a second page.
const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: "Helvetica", color: "#1a1a1a" },
  header: { alignItems: "center", marginBottom: 6 },
  name: { fontSize: 15, fontWeight: 700, letterSpacing: 0.5 },
  roleTitle: { fontSize: 10, color: "#333", marginTop: 1, marginBottom: 2 },
  contact: { fontSize: 8, color: "#555" },
  summary: { marginBottom: 6, lineHeight: 1.3, fontSize: 9 },
  sectionHeading: {
    fontSize: 9.5,
    fontWeight: 700,
    marginTop: 6,
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottom: "1pt solid #999",
    paddingBottom: 1.5,
  },
  itemBlock: { marginBottom: 4 },
  itemHeader: { flexDirection: "row", justifyContent: "space-between" },
  itemTitle: { fontWeight: 700, fontSize: 9 },
  itemDates: { color: "#555", fontSize: 8 },
  bullet: { marginLeft: 9, marginTop: 1, lineHeight: 1.25 },
  // Bold, but not the section-heading weight — no uppercase/letterSpacing/border,
  // so it reads as "emphasized within the sentence" rather than a heading.
  skillHighlight: { fontWeight: 700 },
  techStack: {
    marginLeft: 9,
    marginTop: 1,
    fontSize: 7.5,
    color: "#666",
    fontStyle: "italic",
  },
  projectsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  projectCard: { width: "48%", marginBottom: 5 },
  projectTitle: { fontWeight: 700, fontSize: 9, marginBottom: 1 },
  projectDesc: { fontSize: 8, lineHeight: 1.25, color: "#333" },
  projectTech: {
    fontSize: 7.5,
    color: "#666",
    marginTop: 1,
    fontStyle: "italic",
  },
  skillsLine: { fontSize: 8, lineHeight: 1.4, color: "#333" },
  eduBlock: { marginBottom: 2 },
});

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Splits bullet/description text on any of the given skill terms and wraps
 * matches in the bold-but-not-heading style, so "Built with React and
 * Supabase" renders with React/Supabase emphasized inline. Falls back to
 * plain text if there are no terms to match.
 */
function highlightSkills(text: string, terms: string[]) {
  const clean = terms.filter(Boolean);
  if (clean.length === 0) return text;

  const pattern = new RegExp(`(${clean.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const isMatch = clean.some((t) => t.toLowerCase() === part.toLowerCase());
    return isMatch ? (
      <Text key={i} style={styles.skillHighlight}>
        {part}
      </Text>
    ) : (
      part
    );
  });
}

export function ResumeDocument({
  profile,
  resume,
}: {
  profile: Profile;
  resume: ResumeDraft;
}) {
  const contactParts = [
    profile.email,
    profile.phone,
    profile.location,
    profile.links.linkedin,
    profile.links.github,
    profile.links.portfolio,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.full_name.toUpperCase()}</Text>
          <Text style={styles.roleTitle}>{resume.role_title}</Text>
          <Text style={styles.contact}>{contactParts.join(" | ")}</Text>
        </View>

        {resume.summary && (
          <>
            <Text style={styles.sectionHeading}>Professional Summary</Text>
            <Text style={styles.summary}>{resume.summary}</Text>
          </>
        )}

        {resume.experience.length > 0 && (
          <View>
            <Text style={styles.sectionHeading}>Work Experience</Text>
            {resume.experience.map((job, i) => (
              <View key={i} style={styles.itemBlock}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {job.title}
                    {job.organization ? ` — ${job.organization}` : ""}
                  </Text>
                  {job.dates && (
                    <Text style={styles.itemDates}>{job.dates}</Text>
                  )}
                </View>
                {job.bullets.map((b, k) => (
                  <Text key={k} style={styles.bullet}>
                    • {highlightSkills(b, job.tech_stack)}
                  </Text>
                ))}
                {job.tech_stack.length > 0 && (
                  <Text style={styles.techStack}>
                    Tech Stack: {job.tech_stack.join(", ")}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {resume.projects.length > 0 && (
          <View>
            <Text style={styles.sectionHeading}>Projects</Text>
            <View style={styles.projectsGrid}>
              {resume.projects.map((p, i) => (
                <View key={i} style={styles.projectCard}>
                  <Text style={styles.projectTitle}>{p.title}</Text>
                  <Text style={styles.projectDesc}>
                    {highlightSkills(p.description, p.tech_stack)}
                  </Text>
                  {p.tech_stack.length > 0 && (
                    <Text style={styles.projectTech}>
                      {p.tech_stack.join(", ")}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {resume.skills.length > 0 && (
          <View>
            <Text style={styles.sectionHeading}>Technology Experience</Text>
            <Text style={styles.skillsLine}>{resume.skills.join(" | ")}</Text>
          </View>
        )}

        {resume.education.length > 0 && (
          <View>
            <Text style={styles.sectionHeading}>Education</Text>
            {resume.education.map((edu, i) => (
              <View key={i} style={styles.eduBlock}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {edu.title}
                    {edu.organization ? ` — ${edu.organization}` : ""}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
