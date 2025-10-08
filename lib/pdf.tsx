import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register fonts if needed
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Roboto',
    lineHeight: 1.4,
    color: '#333',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 'auto',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 12,
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 5,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: '#374151',
    flex: 1,
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1f2937',
    marginRight: 10,
    minWidth: 30,
    textAlign: 'right',
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    flex: 2,
    marginLeft: 10,
  },
  scoreFill: {
    height: 8,
    borderRadius: 4,
  },
  overallScore: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  overallScoreText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1f2937',
    textAlign: 'center',
  },
  leverItem: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderLeft: '3 solid #2563eb',
  },
  leverTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 4,
  },
  leverDescription: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 3,
  },
  leverImpact: {
    fontSize: 11,
    fontWeight: 500,
    color: '#059669',
  },
  riskItem: {
    fontSize: 11,
    color: '#dc2626',
    marginBottom: 4,
    paddingLeft: 10,
  },
  cta: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: 15,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 600,
    marginTop: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 15,
  },
  footerCompany: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 5,
  },
  footerContact: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
});

interface AssessmentData {
  user: {
    company: string;
    email: string;
  };
  industry?: string;
  scoreInbound: number;
  scoreOutbound: number;
  scoreContent: number;
  scorePaid: number;
  scoreNurture: number;
  scoreInfra: number;
  scoreAttribution: number;
  scoreOverall: number;
  growthLevers: Array<{
    name: string;
    why: string;
    expectedImpact: string;
    confidence: string;
    firstStep: string;
  }>;
  riskFlags: string[];
  createdAt: string;
}

export function AssessmentPdf({ assessment }: { assessment: AssessmentData }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#059669'; // green
    if (score >= 60) return '#d97706'; // orange
    return '#dc2626'; // red
  };

  const ScoreRow = ({ label, score }: { label: string; score: number }) => (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{score}/100</Text>
      <View style={styles.scoreBar}>
        <View 
          style={[
            styles.scoreFill, 
            { 
              width: `${score}%`, 
              backgroundColor: getScoreColor(score) 
            }
          ]} 
        />
      </View>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image 
            style={styles.logo} 
            src="/logo_Nytro_color.png"
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Lead Generation Assessment</Text>
          <Text style={styles.subtitle}>Company: {assessment.user.company}</Text>
          {assessment.industry && (
            <Text style={styles.subtitle}>Industry: {assessment.industry}</Text>
          )}
          <Text style={styles.subtitle}>
            Generated: {new Date(assessment.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Overall Score */}
        <View style={styles.overallScore}>
          <Text style={styles.overallScoreText}>
            Overall Lead Generation Maturity: {assessment.scoreOverall}/100
          </Text>
        </View>

        {/* Score Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score Breakdown</Text>
          <ScoreRow label="Inbound Marketing" score={assessment.scoreInbound} />
          <ScoreRow label="Outbound Sales" score={assessment.scoreOutbound} />
          <ScoreRow label="Content Marketing" score={assessment.scoreContent} />
          <ScoreRow label="Paid Advertising" score={assessment.scorePaid} />
          <ScoreRow label="Lead Nurturing" score={assessment.scoreNurture} />
          <ScoreRow label="Marketing Infrastructure" score={assessment.scoreInfra} />
          <ScoreRow label="Attribution & Analytics" score={assessment.scoreAttribution} />
        </View>

        {/* Top Growth Levers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Growth Opportunities</Text>
          {assessment.growthLevers.map((lever, index) => (
            <View key={index} style={styles.leverItem}>
              <Text style={styles.leverTitle}>
                {index + 1}. {lever.name}
              </Text>
              <Text style={styles.leverDescription}>{lever.why}</Text>
              <Text style={styles.leverImpact}>
                Expected Impact: {lever.expectedImpact} (Confidence: {lever.confidence})
              </Text>
            </View>
          ))}
        </View>

        {/* Risk Flags */}
        {assessment.riskFlags && assessment.riskFlags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Risk Areas</Text>
            {assessment.riskFlags.map((risk, index) => (
              <Text key={index} style={styles.riskItem}>• {risk}</Text>
            ))}
          </View>
        )}

        {/* CTA */}
        <Text style={styles.cta}>
          Ready to implement these recommendations? Book a free 15-minute audit with our demand generation experts to get started.
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerCompany}>Nytro Marketing</Text>
          <Text style={styles.footerContact}>www.nytromarketing.com</Text>
          <Text style={styles.footerContact}>info@nytromarketing.com</Text>
        </View>
      </Page>
    </Document>
  );
}
