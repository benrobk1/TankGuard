import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a56db', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  generatedAt: { fontSize: 8, color: '#9ca3af', marginTop: 8 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  row: { flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 2, borderBottomColor: '#d1d5db', backgroundColor: '#f9fafb' },
  cell: { flex: 1, paddingHorizontal: 4 },
  cellSmall: { width: 60, paddingHorizontal: 4 },
  cellMedium: { width: 90, paddingHorizontal: 4 },
  bold: { fontWeight: 'bold' },
  statusCompliant: { color: '#059669' },
  statusOverdue: { color: '#dc2626' },
  statusDueSoon: { color: '#d97706' },
  summaryGrid: { flexDirection: 'row', marginBottom: 16 },
  summaryBox: { flex: 1, padding: 10, marginRight: 8, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4 },
  summaryLabel: { fontSize: 8, color: '#6b7280', marginBottom: 2 },
  summaryValue: { fontSize: 16, fontWeight: 'bold' },
  scoreBox: { padding: 12, borderRadius: 4, marginBottom: 16, alignItems: 'center' as const },
  scoreValue: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  scoreLabel: { fontSize: 10, color: '#ffffff', opacity: 0.9 },
  footer: { position: 'absolute' as const, bottom: 20, left: 40, right: 40, fontSize: 8, color: '#9ca3af' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  tankDetail: { marginBottom: 4, fontSize: 9 },
  verificationBar: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 3, padding: 8, marginBottom: 16 },
  verificationItem: { fontSize: 7, color: '#1e40af', textAlign: 'center' as const },
  verificationLabel: { fontSize: 6, color: '#3b82f6', marginTop: 1 },
});

interface AuditComplianceItem {
  description: string;
  dueDate: string;
  status: string;
  itemType: string;
  completedDate?: string | null;
  tank?: { tankNumber: string } | null;
  rule?: { citation?: string | null; inspectionType: string } | null;
}

interface AuditData {
  generatedAt: string;
  facility: {
    name: string;
    address: string;
    city: string;
    zip: string;
    registrationNumber?: string | null;
    state: { name: string; abbreviation: string };
  };
  tanks: Array<{
    tankNumber: string;
    capacityGallons: number;
    material: string;
    productStored: string;
    status: string;
    leakDetectionMethod: string;
    corrosionProtectionType?: string | null;
    hasSecondaryContainment: boolean;
    installationDate?: string | null;
  }>;
  complianceSummary: {
    total: number;
    upcoming: number;
    dueSoon: number;
    overdue: number;
    completed: number;
    waived: number;
  };
  complianceItems: AuditComplianceItem[];
  operators: Array<{
    name: string;
    operatorClass: string;
    certificationDate?: string | null;
    certificationExpiration?: string | null;
  }>;
}

const TYPE_ORDER = ['FINANCIAL', 'REPORTING', 'INSPECTION', 'TEST', 'CERTIFICATION', 'TRAINING', 'DOCUMENTATION', 'CLOSURE'];
const TYPE_LABELS: Record<string, string> = {
  INSPECTION: 'Inspections', TEST: 'Tests', CERTIFICATION: 'Certifications', TRAINING: 'Training',
  DOCUMENTATION: 'Documentation', REPORTING: 'Regulatory Reporting', FINANCIAL: 'Financial Responsibility', CLOSURE: 'Closure',
};

function formatDate(d: string | null | undefined): string {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatEnum(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#059669';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

function statusColor(status: string) {
  switch (status) {
    case 'COMPLETED': return styles.statusCompliant;
    case 'OVERDUE': return styles.statusOverdue;
    case 'DUE_SOON': return styles.statusDueSoon;
    default: return {};
  }
}

function AuditReport({ data }: { data: AuditData }) {
  const { facility, tanks, complianceSummary: cs, complianceItems, operators } = data;
  const score = cs.total > 0 ? Math.round((cs.completed / cs.total) * 100) : 100;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>TankGuard Compliance Audit Report</Text>
          <Text style={styles.subtitle}>{facility.name}</Text>
          <Text style={styles.subtitle}>{facility.address}, {facility.city}, {facility.state.abbreviation} {facility.zip}</Text>
          {facility.registrationNumber && (
            <Text style={styles.subtitle}>Registration: {facility.registrationNumber}</Text>
          )}
          <Text style={styles.generatedAt}>Generated: {formatDate(data.generatedAt)}</Text>
        </View>

        {/* Verification & Trust Bar */}
        <View style={styles.verificationBar}>
          <View style={{ alignItems: 'center' as const, flex: 1 }}>
            <Text style={styles.verificationItem}>EPA 40 CFR 280</Text>
            <Text style={styles.verificationLabel}>Federal Aligned</Text>
          </View>
          <View style={{ alignItems: 'center' as const, flex: 1 }}>
            <Text style={styles.verificationItem}>{facility.state.abbreviation} State Rules</Text>
            <Text style={styles.verificationLabel}>State Verified</Text>
          </View>
          <View style={{ alignItems: 'center' as const, flex: 1 }}>
            <Text style={styles.verificationItem}>1,500+ Rules</Text>
            <Text style={styles.verificationLabel}>Comprehensive</Text>
          </View>
          <View style={{ alignItems: 'center' as const, flex: 1 }}>
            <Text style={styles.verificationItem}>April 2026</Text>
            <Text style={styles.verificationLabel}>Last Updated</Text>
          </View>
          <View style={{ alignItems: 'center' as const, flex: 1 }}>
            <Text style={styles.verificationItem}>Encrypted</Text>
            <Text style={styles.verificationLabel}>Data Secured</Text>
          </View>
        </View>

        {/* Compliance Score */}
        <View style={[styles.scoreBox, { backgroundColor: getScoreColor(score) }]}>
          <Text style={styles.scoreValue}>{score}%</Text>
          <Text style={styles.scoreLabel}>Overall Compliance Score</Text>
        </View>

        {/* Summary Grid */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Items</Text>
            <Text style={styles.summaryValue}>{cs.total}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Completed</Text>
            <Text style={[styles.summaryValue, styles.statusCompliant]}>{cs.completed}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Due Soon</Text>
            <Text style={[styles.summaryValue, styles.statusDueSoon]}>{cs.dueSoon}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Overdue</Text>
            <Text style={[styles.summaryValue, styles.statusOverdue]}>{cs.overdue}</Text>
          </View>
          <View style={[styles.summaryBox, { marginRight: 0 }]}>
            <Text style={styles.summaryLabel}>Upcoming</Text>
            <Text style={styles.summaryValue}>{cs.upcoming}</Text>
          </View>
        </View>

        {/* Tank Inventory */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tank Inventory ({tanks.length} tanks)</Text>
          <View style={styles.headerRow}>
            <Text style={[styles.cellSmall, styles.bold]}>Tank #</Text>
            <Text style={[styles.cellMedium, styles.bold]}>Material</Text>
            <Text style={[styles.cellSmall, styles.bold]}>Capacity</Text>
            <Text style={[styles.cellMedium, styles.bold]}>Product</Text>
            <Text style={[styles.cellMedium, styles.bold]}>Leak Detection</Text>
            <Text style={[styles.cellSmall, styles.bold]}>Status</Text>
          </View>
          {tanks.map((tank, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.cellSmall}>{tank.tankNumber}</Text>
              <Text style={styles.cellMedium}>{formatEnum(tank.material)}</Text>
              <Text style={styles.cellSmall}>{tank.capacityGallons.toLocaleString()} gal</Text>
              <Text style={styles.cellMedium}>{formatEnum(tank.productStored)}</Text>
              <Text style={styles.cellMedium}>{formatEnum(tank.leakDetectionMethod)}</Text>
              <Text style={styles.cellSmall}>{formatEnum(tank.status)}</Text>
            </View>
          ))}
        </View>

        {/* Operators */}
        {operators.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Designated Operators</Text>
            <View style={styles.headerRow}>
              <Text style={[styles.cell, styles.bold]}>Name</Text>
              <Text style={[styles.cellMedium, styles.bold]}>Class</Text>
              <Text style={[styles.cellMedium, styles.bold]}>Certified</Text>
              <Text style={[styles.cellMedium, styles.bold]}>Expires</Text>
            </View>
            {operators.map((op, idx) => (
              <View key={idx} style={styles.row}>
                <Text style={styles.cell}>{op.name}</Text>
                <Text style={styles.cellMedium}>{formatEnum(op.operatorClass)}</Text>
                <Text style={styles.cellMedium}>{formatDate(op.certificationDate)}</Text>
                <Text style={styles.cellMedium}>{formatDate(op.certificationExpiration)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={styles.footerRow}>
            <Text>TankGuard - UST Compliance Tracking | Rules verified against EPA 40 CFR 280 & state programs</Text>
            <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <Text>Not legal or regulatory advice. Verify requirements with your implementing agency. Data encrypted in transit and at rest.</Text>
        </View>
      </Page>

      {/* Compliance Items - separate page, grouped by status then type */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compliance Items Detail</Text>

          {[
            { status: 'OVERDUE', label: 'Overdue Items', style: styles.statusOverdue, dateLabel: 'Due' },
            { status: 'DUE_SOON', label: 'Due Soon', style: styles.statusDueSoon, dateLabel: 'Due' },
            { status: 'UPCOMING', label: 'Upcoming', style: {}, dateLabel: 'Due' },
            { status: 'COMPLETED', label: 'Completed', style: styles.statusCompliant, dateLabel: 'Done' },
          ].map(({ status, label, style, dateLabel }) => {
            const statusItems = complianceItems.filter((i) => i.status === status);
            if (statusItems.length === 0) return null;

            // Group by itemType, ordered by TYPE_ORDER (FINANCIAL/REPORTING first)
            const byType = TYPE_ORDER.reduce<Record<string, AuditComplianceItem[]>>((acc, type) => {
              const items = statusItems.filter((i) => i.itemType === type);
              if (items.length > 0) acc[type] = items;
              return acc;
            }, {});
            // Also catch any items with unknown types
            const knownTypes = new Set(TYPE_ORDER);
            const unknownItems = statusItems.filter((i) => !knownTypes.has(i.itemType));
            if (unknownItems.length > 0) byType['OTHER'] = unknownItems;

            return (
              <View key={status} style={{ marginBottom: 12 }}>
                <Text style={[styles.bold, style, { marginBottom: 4 }]}>{label} ({statusItems.length})</Text>
                {Object.entries(byType).map(([type, items]) => (
                  <View key={type} style={{ marginBottom: 6 }}>
                    <Text style={{ fontSize: 8, color: '#6b7280', marginBottom: 2, textTransform: 'uppercase' as const }}>
                      {TYPE_LABELS[type] || type}
                    </Text>
                    {items.map((item, idx) => (
                      <View key={idx} style={styles.row}>
                        <Text style={[styles.cell, { flex: 3 }]}>{item.description}</Text>
                        <Text style={styles.cellMedium}>{item.tank ? `Tank ${item.tank.tankNumber}` : 'Facility'}</Text>
                        <Text style={[styles.cellMedium, style]}>
                          {dateLabel}: {formatDate(status === 'COMPLETED' ? item.completedDate : item.dueDate)}
                        </Text>
                        <Text style={styles.cellMedium}>{item.rule?.citation || ''}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            );
          })}
        </View>

        <View style={styles.footer} fixed>
          <View style={styles.footerRow}>
            <Text>TankGuard - UST Compliance Tracking | Rules verified against EPA 40 CFR 280 & state programs</Text>
            <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
          <Text>Not legal or regulatory advice. Verify requirements with your implementing agency. Data encrypted in transit and at rest.</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateAuditPdf(data: AuditData): Promise<Buffer> {
  const buffer = await renderToBuffer(<AuditReport data={data} />);
  return Buffer.from(buffer);
}
