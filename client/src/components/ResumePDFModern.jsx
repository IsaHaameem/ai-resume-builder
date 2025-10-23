import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Link } from '@react-pdf/renderer'; // Import Link

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/lato/v16/S6uyw4BMUTPHvxk.ttf', fontWeight: 400 }, // Regular
    { src: 'https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh6UVSwi.ttf', fontWeight: 700 }, // Bold
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row', // Main layout direction: Sidebar | Main Content
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10, // Base font size
    lineHeight: 1.4, // Line spacing
  },
  sidebar: {
    width: '35%', // Sidebar takes 35% of the page width
    padding: 25,
    backgroundColor: '#f5f5f5', // Light gray background for sidebar
    color: '#333', // Dark text color for sidebar
  },
  main: {
    width: '65%', // Main content takes the remaining 65%
    padding: 25,
  },
  // --- Header & Contact (Sidebar) ---
  name: {
    fontSize: 24,
    fontWeight: 'bold', // Use registered bold font weight
    fontFamily: 'Helvetica-Bold', // Specify bold font
    marginBottom: 5,
    color: '#000', // Black color for name
  },
  contactInfo: {
    marginBottom: 20, // Space below the contact block
  },
  contactLine: {
    fontSize: 10,
    marginBottom: 3, // Small space between contact lines
  },
  phoneLine: { // Specific style for phone number line
    fontSize: 10,
    marginBottom: 8, // Increased space after phone number
  },
  contactLink: {
    fontSize: 10,
    marginBottom: 3,
    color: '#007bff', // Blue color for links
    textDecoration: 'none' // Remove underline from links
  },
  // --- Section (Sidebar) ---
  sidebarSection: {
    marginBottom: 15, // Space below each sidebar section
  },
  sidebarTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    textTransform: 'uppercase', // Make titles uppercase
    borderBottomWidth: 1, // Underline for titles
    borderBottomColor: '#ccc', // Light gray underline
    paddingBottom: 2, // Space between text and underline
  },
  // --- Section (Main Content) ---
  mainSection: {
    marginBottom: 15, // Space below each main section
  },
  projectsSection: { // Specific style for projects section margin
    marginBottom: 20, // Increased space before the next section (Certifications)
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    color: '#333',
    marginBottom: 10,
    textTransform: 'uppercase',
    borderBottomWidth: 2, // Thicker underline for main titles
    borderBottomColor: '#333', // Darker underline
    paddingBottom: 3,
  },
  // --- General Content Styles ---
  summary: {
    fontSize: 10,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  companyInfo: {
    flexDirection: 'row', // Align company and duration on the same line
    justifyContent: 'space-between', // Push company and duration apart
    fontSize: 10,
    color: '#444',
    marginBottom: 5,
  },
  bulletPoint: {
    flexDirection: 'row', // Align bullet and text horizontally
    marginBottom: 3,
  },
  bullet: {
    width: 10, // Fixed width for bullet character
    fontSize: 10,
    marginRight: 5, // Space between bullet and text
  },
  bulletText: {
    flex: 1, // Allow text to take remaining space
  },
  projectTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  projectLink: {
    color: '#007bff', // Blue link color
    textDecoration: 'none',
    fontSize: 10,
    marginLeft: 5
  },
  skill: { // Used for list items in sidebar (Education, Skills, Certifications)
    marginBottom: 3,
  }
});

// Create Document Component
const ResumePDFModern = ({ resume, formData }) => (
  <Document>
    <Page size="A4" style={styles.page}>

      {/* ----------------- */}
      {/* --- Sidebar --- */}
      {/* ----------------- */}
      <View style={styles.sidebar}>
        {/* Header with Links */}
        <View style={styles.contactInfo}>
          <Text style={styles.name}>{formData.name}</Text>
          {/* Applied phoneLine style for extra margin */}
          <Text style={styles.phoneLine}>{formData.phone}</Text>
          <Text style={styles.contactLine}>{formData.email}</Text>
          {/* Render links conditionally */}
          {formData.linkedin && <Link style={styles.contactLink} src={formData.linkedin}>LinkedIn</Link>}
          {formData.github && <Link style={styles.contactLink} src={formData.github}>GitHub</Link>}
          {formData.portfolio && <Link style={styles.contactLink} src={formData.portfolio}>Portfolio</Link>}
        </View>

        {/* Education */}
        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarTitle}>Education</Text>
          {/* Map directly over the array of strings */}
          {resume.education.map((eduLine, i) => (
            <Text key={i} style={styles.skill}>{eduLine}</Text>
          ))}
        </View>

        {/* Skills */}
        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarTitle}>Technical Skills</Text>
          {resume.skills.technical.map((skill, i) => (
            <Text key={i} style={styles.skill}>{skill}</Text>
          ))}
        </View>
        {/* Soft Skills Section */}
        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarTitle}>Soft Skills</Text>
          {resume.skills.soft.map((skill, i) => (
            <Text key={i} style={styles.skill}>{skill}</Text>
          ))}
        </View>
      </View>

      {/* ---------------------- */}
      {/* --- Main Content --- */}
      {/* ---------------------- */}
      <View style={styles.main}>
        {/* Summary */}
        <View style={styles.mainSection}>
          <Text style={styles.mainTitle}>Professional Summary</Text>
          <Text style={styles.summary}>{resume.summary}</Text>
        </View>

        {/* Experience */}
        <View style={styles.mainSection}>
          <Text style={styles.mainTitle}>Experience</Text>
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

        {/* Projects */}
        {/* Applied projectsSection style for extra margin */}
        <View style={styles.projectsSection}>
          <Text style={styles.mainTitle}>Projects</Text>
          {resume.projects.map((proj, i) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <Text style={styles.projectTitle}>
                {proj.name}
                {/* Display link if it exists */}
                {proj.link && <Link style={styles.projectLink} src={proj.link}> [Link]</Link>}
              </Text>
              <Text style={styles.bulletText}>{proj.description}</Text>
            </View>
          ))}
        </View>

        {/* Certifications */}
        {/* Check if certifications exist and have items */}
        {resume.certifications && resume.certifications.length > 0 && (
          <View style={styles.mainSection}>
            <Text style={styles.mainTitle}>Certifications</Text>
            {/* Map directly over the array of strings */}
            {resume.certifications.map((certLine, i) => (
              <Text key={i} style={styles.skill}>{certLine}</Text>
            ))}
          </View>
        )}
      </View>
    </Page>
  </Document>
);

export default ResumePDFModern;