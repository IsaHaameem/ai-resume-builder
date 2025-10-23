import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer'; // Import Link

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.4,
    color: '#333',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4, // Space between name and contact info
  },
  contactInfo: {
    fontSize: 10,
    color: '#555',
    flexDirection: 'row', // Arrange contact items horizontally
    justifyContent: 'center', // Center the contact items
    flexWrap: 'wrap', // Allow items to wrap if needed
  },
  contactLink: {
    marginHorizontal: 5, // Space around the '|' separators and links
    textDecoration: 'none',
    color: '#555', // Or use a blue color like '#007bff' for links
  },
  section: {
    marginBottom: 15, // Space below each section
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#aaa',
    paddingBottom: 2,
    marginBottom: 8, // Space between title and content
    textTransform: 'uppercase',
  },
  content: {
    fontSize: 11,
  },
  // Experience Styles
  jobTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  companyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 11,
    color: '#444',
    marginBottom: 4,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    width: 10, // Fixed width for the bullet character
    fontSize: 10,
    marginRight: 5,
  },
  bulletText: {
    flex: 1, // Allow text to take remaining space
  },
  projectTitle: {
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2
  },
  projectLink: {
    color: '#007bff', // Blue link color
    textDecoration: 'none',
    fontSize: 10,
    marginLeft: 5
  },
});

// Create Document Component
const ResumePDFClassic = ({ resume, formData }) => (
  <Document>
    <Page size="A4" style={styles.page}>

      {/* 1. Header with Name and Contact Links */}
      <View style={styles.header}>
        <Text style={styles.name}>{formData.name}</Text>
        <View style={styles.contactInfo}>
          {/* Display contact info conditionally with separators */}
          <Text>{formData.email}</Text>
          <Text style={{ marginHorizontal: 5 }}> | </Text>
          <Text>{formData.phone}</Text>
          {formData.linkedin && (<><Text style={{ marginHorizontal: 5 }}> | </Text><Link style={styles.contactLink} src={formData.linkedin}>LinkedIn</Link></>)}
          {formData.github && (<><Text style={{ marginHorizontal: 5 }}> | </Text><Link style={styles.contactLink} src={formData.github}>GitHub</Link></>)}
          {formData.portfolio && (<><Text style={{ marginHorizontal: 5 }}> | </Text><Link style={styles.contactLink} src={formData.portfolio}>Portfolio</Link></>)}
        </View>
      </View>

      {/* 2. Professional Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text style={styles.content}>{resume.summary}</Text>
      </View>

      {/* 3. Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <Text style={styles.content}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Technical Skills: </Text>
          {resume.skills.technical.join(', ')}
        </Text>
        <Text style={styles.content}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Soft Skills: </Text>
          {resume.skills.soft.join(', ')}
        </Text>
      </View>

      {/* 4. Experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        {resume.experience.map((exp, i) => (
          <View key={i} style={{ marginBottom: 10 }}>
            <Text style={styles.jobTitle}>{exp.title}</Text>
            <View style={styles.companyInfo}>
              <Text>{exp.company}</Text>
              <Text>{exp.duration}</Text>
            </View>
            {exp.bulletPoints.map((point, j) => (
              <View key={j} style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{point}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* 5. Education */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        {/* Map directly over the array of strings */}
        {resume.education.map((eduLine, i) => (
          <Text key={i} style={styles.content}>{eduLine}</Text>
        ))}
      </View>

      {/* 6. Projects */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projects</Text>
        {resume.projects.map((proj, i) => (
          <View key={i} style={{ marginBottom: 5 }}>
            <Text style={styles.projectTitle}>
              {proj.name}
              {/* Display link if it exists */}
              {proj.link && <Link style={styles.projectLink} src={proj.link}> [Link]</Link>}
            </Text>
            <Text style={styles.content}>{proj.description}</Text>
          </View>
        ))}
      </View>

      {/* 7. Certifications */}
      {/* Check if certifications exist and have items */}
      {resume.certifications && resume.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {/* Map directly over the array of strings */}
            {resume.certifications.map((certLine, i) => (
              <Text key={i} style={styles.content}>{certLine}</Text>
            ))}
          </View>
      )}

    </Page>
  </Document>
);

export default ResumePDFClassic;