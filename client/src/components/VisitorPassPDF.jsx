import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, Image
} from '@react-pdf/renderer'

const statusColors = {
  Pending:    '#f59e0b',
  Approved:   '#10b981',
  Rejected:   '#ef4444',
  CheckedIn:  '#3b82f6',
  CheckedOut: '#6366f1',
  Cancelled:  '#9ca3af',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 30,
    backgroundColor: '#ffffff',
    color: '#1e293b',
  },
  header: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyName: {
    color: '#ffffff',
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
  },
  companyTagline: {
    color: '#94a3b8',
    fontSize: 9,
    marginTop: 3,
  },
  passTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  passNumberBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  passNumberText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    textAlign: 'right',
  },

  statusBanner: {
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    letterSpacing: 2,
  },

  body: {
    flexDirection: 'row',
    gap: 14,
  },
  leftCol: {
    flex: 1,
  },
  rightCol: {
    width: 140,
    alignItems: 'center',
  },

  section: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 100,
    color: '#64748b',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  value: {
    flex: 1,
    color: '#1e293b',
    fontSize: 9,
  },

  qrBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  qrImage: {
    width: 110,
    height: 110,
  },
  qrLabel: {
    fontSize: 7,
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'center',
  },

  timeBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 8,
    width: '100%',
    marginBottom: 8,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 7,
    color: '#64748b',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  timeValue: {
    fontSize: 10,
    color: '#1e293b',
    fontFamily: 'Helvetica-Bold',
  },
  timeNA: {
    fontSize: 9,
    color: '#94a3b8',
  },

  footer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  footerTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  footerItem: {
    fontSize: 8,
    color: '#64748b',
  },
  footerValue: {
    fontSize: 8,
    color: '#1e293b',
    fontFamily: 'Helvetica-Bold',
  },
  bullet: {
    fontSize: 8,
    color: '#475569',
    marginBottom: 3,
  },
})

const fmt = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const fmtTime = (dateStr) => {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

const VisitorPassPDF = ({ visitor, qrDataUrl }) => {
  const status = visitor.status || 'Pending'
  const bgColor = statusColors[status] || '#64748b'
  const passNo = visitor.passNumber || 'N/A'

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>VPMS</Text>
            <Text style={styles.companyTagline}>Visitor Pass Management System</Text>
          </View>
          <View>
            <Text style={styles.passTitle}>VISITOR PASS</Text>
            <View style={styles.passNumberBadge}>
              <Text style={styles.passNumberText}>{passNo}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.statusBanner, { backgroundColor: bgColor }]}>
          <Text style={styles.statusText}>STATUS: {status.toUpperCase()}</Text>
        </View>

        <View style={styles.body}>

          <View style={styles.leftCol}>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Visitor Information</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Full Name</Text>
                <Text style={styles.value}>{visitor.visitorName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Mobile Number</Text>
                <Text style={styles.value}>{visitor.visitorPhone}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{visitor.visitorEmail || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Visit Information</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Person to Meet</Text>
                <Text style={styles.value}>{visitor.employeeToVisit?.name || 'N/A'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Department</Text>
                <Text style={styles.value}>{visitor.employeeToVisit?.department || 'N/A'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Visit Date</Text>
                <Text style={styles.value}>{fmt(visitor.visitDate)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Expected Arrival</Text>
                <Text style={styles.value}>{fmtTime(visitor.expectedArrivalTime) || 'N/A'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Purpose</Text>
                <Text style={styles.value}>{visitor.purposeOfVisit}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Approval Details</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Remarks</Text>
                <Text style={styles.value}>{visitor.remarks || 'None'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Registered By</Text>
                <Text style={styles.value}>{visitor.createdBy?.name || 'N/A'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Registered On</Text>
                <Text style={styles.value}>{fmt(visitor.createdAt)}</Text>
              </View>
            </View>

          </View>

          <View style={styles.rightCol}>

            <View style={styles.qrBox}>
              {qrDataUrl ? (
                <Image src={qrDataUrl} style={styles.qrImage} />
              ) : (
                <Text style={{ fontSize: 9, color: '#94a3b8' }}>QR not available{'\n'}(No pass number)</Text>
              )}
              <Text style={styles.qrLabel}>Scan to verify{'\n'}this visitor pass</Text>
            </View>

            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>Check-In Time</Text>
              {fmtTime(visitor.checkInTime)
                ? <Text style={styles.timeValue}>{fmtTime(visitor.checkInTime)}</Text>
                : <Text style={styles.timeNA}>Not checked in</Text>
              }
            </View>

            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>Check-Out Time</Text>
              {fmtTime(visitor.checkOutTime)
                ? <Text style={styles.timeValue}>{fmtTime(visitor.checkOutTime)}</Text>
                : <Text style={styles.timeNA}>Not checked out</Text>
              }
            </View>

          </View>
        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Instructions</Text>
          <Text style={styles.bullet}>• The visitor must complete Check-Out before leaving.</Text>
          <Text style={styles.bullet}>• This pass is non-transferable.</Text>
          <Text style={styles.bullet}>• Please present this pass at the reception desk.</Text>
          <View style={styles.footerRow}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Text style={styles.footerItem}>Reception: </Text>
              <Text style={styles.footerValue}>+91 XXXXX XXXXX</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Text style={styles.footerItem}>Email: </Text>
              <Text style={styles.footerValue}>reception@company.com</Text>
            </View>
            <Text style={styles.footerItem}>Generated: {new Date().toLocaleString('en-IN')}</Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}

export default VisitorPassPDF