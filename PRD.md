# Product Requirements Document (PRD)
# Training Dashboard

**Version:** 1.1  
**Date:** February 20, 2026  
**Author:** Training Team  
**Status:** Draft

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals & Objectives](#goals--objectives)
4. [Target Users](#target-users)
5. [User Personas](#user-personas)
6. [Core Features](#core-features)
7. [User Flows](#user-flows)
8. [Technical Requirements](#technical-requirements)
9. [Integration Requirements](#integration-requirements)
10. [Non-Functional Requirements](#non-functional-requirements)
11. [Success Metrics & KPIs](#success-metrics--kpis)
12. [Out of Scope](#out-of-scope)
13. [Risks & Mitigations](#risks--mitigations)
14. [Future Considerations](#future-considerations)

---

## Executive Summary

The Training Dashboard is a comprehensive web application designed to serve as a centralized platform for managing, tracking, and reporting on all training activities within the organization. It addresses the critical gap created by the absence of a Learning Management System (LMS) and the limitations of tracking training activities through Outlook calendars.

The dashboard will provide real-time visibility into training operations—planned, ongoing, and completed—enabling trainers, managers, and leadership to make data-driven decisions about resource allocation, productivity optimization, and training effectiveness.

---

## Problem Statement

### Current Challenges

1. **No Centralized Tracking System:** Without an LMS, there is no single source of truth for training activities across the organization.

2. **Outlook Limitations:** Calendar invites are scattered, making it impossible to get aggregated views or generate reports on training activities.

3. **Manual Effort:** Trainers and managers spend significant time manually compiling training data for reports and planning.

4. **Lack of Visibility:** Management cannot easily assess:
   - How many trainings are happening at any given time
   - Trainer utilization and productivity
   - Training pipeline and upcoming commitments
   - Historical training data for decision-making

5. **Feedback Collection Gap:** No systematic process for collecting, storing, and analyzing training feedback.

6. **Resource Planning Challenges:** Difficulty in identifying trainer availability, potential overallocation, or underutilization.

### Impact

- Inefficient resource allocation
- Delayed reporting to stakeholders
- Missed opportunities for process improvement
- Inability to demonstrate training team's value and productivity
- Inconsistent feedback collection affecting quality improvement initiatives

---

## Goals & Objectives

### Primary Goal

Create a unified Training Dashboard that serves as the single source of truth for all training activities, enabling efficient tracking, reporting, and resource management.

### Objectives

| Objective | Description | Priority |
|-----------|-------------|----------|
| **Centralized Tracking** | Consolidate all training data in one accessible platform | P0 |
| **Easy Data Entry** | Quick manual entry and bulk CSV/Excel import for training events | P0 |
| **Real-time Visibility** | Provide instant status updates on all training activities | P0 |
| **Automated Feedback** | Generate and distribute feedback forms automatically | P1 |
| **Comprehensive Reporting** | Enable multi-dimensional reporting and analytics | P1 |
| **Smart Notifications** | Send automated reminders and alerts to relevant stakeholders | P1 |
| **Resource Optimization** | Track and visualize trainer utilization and availability | P2 |
| **Outlook Integration** | Auto-capture events from Outlook calendar (requires org approval) | P2 |

---

## Target Users

**Team Size:** ~10 users (small departmental team)

### Primary Users

| User Role | Description | Est. Count | Primary Needs |
|-----------|-------------|------------|---------------|
| **Trainers** | Conduct training sessions (client & internal) | 5-7 | Schedule management, feedback collection, workload visibility |
| **Training Manager** | Oversees training operations and team | 1-2 | Team utilization, scheduling, reporting, resource allocation |
| **Training Head** | Strategic oversight of training function | 1 | Executive dashboards, KPIs, trend analysis |
| **Admin** | System administration | 1 | User management, system configuration |

### Secondary Users (View-only access if needed)

- **Management/Leadership** - High-level metrics and reports (optional access)
- **HR Team** - Training records and compliance data (optional access)

---

## User Personas

### Persona 1: The Trainer (Priya)

**Role:** Senior Product Trainer  
**Goals:**
- Easily manage her training schedule
- Reduce administrative overhead
- Track her own productivity and contributions
- Collect and review feedback to improve

**Pain Points:**
- Spends 2-3 hours weekly compiling her training activities
- Forgets to send feedback forms after training
- Has no visibility into her utilization metrics

**Needs from Dashboard:**
- Quick event creation and bulk import
- Automated feedback form generation
- Personal dashboard showing her training stats

---

### Persona 2: The Training Manager (Rajesh)

**Role:** Training Manager  
**Goals:**
- Ensure optimal trainer utilization
- Generate weekly/monthly reports for leadership
- Plan training schedules efficiently
- Monitor feedback scores across team

**Pain Points:**
- Chases trainers for their schedules
- Manual report compilation takes a full day
- Difficulty balancing workload across team

**Needs from Dashboard:**
- Team calendar view with all trainers
- One-click report generation
- Alerts for scheduling conflicts or underutilization

---

### Persona 3: The Training Head (Anita)

**Role:** Head of Training  
**Goals:**
- Demonstrate training team's value to leadership
- Strategic planning based on historical data
- Ensure quality through feedback analysis
- Resource planning for upcoming quarters

**Pain Points:**
- No quick way to answer leadership queries
- Lacks trend analysis capabilities
- Cannot easily forecast resource needs

**Needs from Dashboard:**
- Executive dashboard with key metrics
- Trend visualization over time
- Forecasting and planning tools

---

## Core Features

### F1: Dashboard & Overview

**Priority:** P0

| Feature | Description |
|---------|-------------|
| **Status Overview** | Visual summary of trainings by status (Planned, Ongoing, Completed, Cancelled) |
| **Period Selector** | Toggle views by Day, Week, Month, Quarter, Year |
| **Quick Stats Cards** | Total trainings, hours delivered, trainers active, feedback score |
| **Activity Feed** | Recent activities and updates across all trainings |

**Acceptance Criteria:**
- Dashboard loads within 3 seconds
- Displays real-time data (max 5-minute delay)
- Responsive design for desktop and tablet
- Role-based view customization

---

### F2: Calendar View

**Priority:** P0

| Feature | Description |
|---------|-------------|
| **Multi-view Calendar** | Day, Week, Month views with training events |
| **Color Coding** | Visual differentiation by training type, status, trainer |
| **Filtering** | Filter by trainer, product, training type, status |
| **Drag & Drop** | Reschedule trainings via drag-and-drop (with confirmation) |

**Acceptance Criteria:**
- Supports viewing multiple trainers simultaneously
- Click on event to view full details
- Mobile-responsive calendar view
- Manual event entry with intuitive forms

---

### F3: Training Event Management

**Priority:** P0

| Feature | Description |
|---------|-------------|
| **Event Creation** | Manual entry form for new training events |
| **Bulk Import** | CSV/Excel import for multiple events |
| **Training Types** | Categorization: Client Training, Internal Training |
| **Product Selection** | Multi-select from product catalog |
| **Status Management** | Update status: Planned → Ongoing → Completed/Cancelled |
| **Event Details** | Duration, attendee count, location/virtual link, prerequisites |

**Event Data Model:**
```
Training Event:
├── Title
├── Description
├── Type (Client/Internal)
├── Product(s)
├── Trainer(s)
├── Date & Time (Start/End)
├── Duration
├── Location/Meeting Link
├── Attendee Count
├── Prerequisites
├── Status
├── Feedback Form Link
├── Post-Training Summary
├── Created By
├── Created Date
├── Last Modified
└── Attachments
```

**Acceptance Criteria:**
- Event creation < 2 minutes for manual entry
- CSV/Excel bulk import for multiple events
- Support for recurring training series
- Attachment support (max 10MB per file)

---

### F4: Product Catalog Management

**Priority:** P1

| Feature | Description |
|---------|-------------|
| **Product List** | Maintain catalog of all products for training |
| **Product Categories** | Group products by category/module |
| **Product Metrics** | Training frequency, average feedback by product |
| **Quick Select** | Search and multi-select during event creation |

**Acceptance Criteria:**
- Admin can add/edit/archive products
- Products searchable by name and category
- Product training history viewable

---

### F5: Automated Feedback System

**Priority:** P1

| Feature | Description |
|---------|-------------|
| **Form Generation** | Auto-create feedback forms for each training |
| **Form Templates** | Customizable templates by training type |
| **Distribution** | Auto-send links to attendees post-training |
| **Response Tracking** | Monitor completion rates |
| **Data Storage** | Store all responses for reporting |
| **Reminder System** | Send reminders for pending feedback |

**Feedback Form Fields (Standard):**
```
- Training Title (Pre-filled)
- Trainer Name (Pre-filled)
- Date (Pre-filled)
- Overall Rating (1-5 stars)
- Content Quality (1-5)
- Trainer Effectiveness (1-5)
- Relevance to Role (1-5)
- Pace of Training (Too Slow/Just Right/Too Fast)
- Key Takeaways (Text)
- Suggestions for Improvement (Text)
- Would Recommend (Yes/No)
- Additional Comments (Text)
```

**Acceptance Criteria:**
- Forms auto-generated upon training completion
- Links distributed within 30 minutes of training end
- Response rate visible on dashboard
- Anonymous option available

---

### F6: Notifications & Reminders

**Priority:** P1

| Feature | Description |
|---------|-------------|
| **Pre-Training Reminders** | Configurable reminders (24h, 1h before) |
| **Prerequisite Alerts** | Notify trainers about pending prep work |
| **Manager Alerts** | Weekly digest of team activities |
| **Feedback Nudges** | Remind attendees to complete feedback |
| **Milestone Notifications** | Alert when targets met/exceeded |

**Notification Channels:**
- In-app notifications
- Email notifications
- Microsoft Teams integration

**Acceptance Criteria:**
- Users can configure notification preferences
- Quiet hours respected (no notifications outside work hours)
- Notification history viewable in app

---

### F7: Post-Training Summary

**Priority:** P1

| Feature | Description |
|---------|-------------|
| **Auto-Generation** | Create summary from event + feedback data |
| **Summary Template** | Standardized format for consistency |
| **Distribution** | Send to configured stakeholders |
| **Archive** | Store for historical reference |

**Summary Contents:**
```
Training Summary Report
├── Training Details (Title, Date, Trainer, Product)
├── Attendance (Registered vs Actual)
├── Duration (Planned vs Actual)
├── Feedback Highlights
│   ├── Overall Rating
│   ├── Response Rate
│   └── Key Comments
├── Trainer Notes
└── Follow-up Actions
```

**Acceptance Criteria:**
- Summary generated within 24 hours of training completion
- Editable before distribution
- PDF export available

---

### F8: Reporting & Analytics

**Priority:** P1

| Feature | Description |
|---------|-------------|
| **Standard Reports** | Pre-built reports for common needs |
| **Custom Reports** | Build reports with selected dimensions |
| **Export Options** | PDF, Excel, CSV export |
| **Scheduled Reports** | Auto-generate and distribute reports |
| **Visualizations** | Charts, graphs, trend lines |

**Standard Reports:**

| Report Name | Description | Audience |
|-------------|-------------|----------|
| **Trainer Performance** | Trainings conducted, hours, feedback scores by trainer | Manager, Head |
| **Product Training Summary** | Training frequency and feedback by product | Manager, Head |
| **Monthly/Quarterly Summary** | Period overview with all key metrics | All |
| **Feedback Analysis** | Aggregated feedback trends and insights | Manager, Head |
| **Utilization Report** | Trainer availability vs actual utilization | Manager, Head |
| **Pipeline Report** | Upcoming trainings and resource allocation | Manager |

**Acceptance Criteria:**
- Reports generate within 30 seconds
- Data filterable by date range, trainer, product, type
- Drill-down capability from summary to details
- Schedule reports for daily/weekly/monthly delivery

---

### F9: Resource & Availability Management

**Priority:** P2

| Feature | Description |
|---------|-------------|
| **Availability Calendar** | Trainers can mark available/unavailable slots |
| **Utilization Metrics** | Track productive vs idle time |
| **Workload Balancing** | Visualize trainer workload distribution |
| **Resource Suggestions** | Recommend trainers for new requests based on availability |
| **Capacity Planning** | Forecast resource needs based on pipeline |

**Metrics Tracked:**
```
Trainer Utilization:
├── Total Available Hours
├── Training Hours (Delivery)
├── Preparation Hours
├── Idle Hours
├── Utilization Rate (%)
└── Trend (vs Previous Period)
```

**Acceptance Criteria:**
- Real-time utilization dashboard
- Alerts for over/under utilization
- Historical trend visualization
- Export capability for capacity planning

---

## User Flows

### Flow 1: Training Event Creation (Manual)

```
┌─────────────────────────────────────────────────────────────────┐
│                    MANUAL EVENT CREATION                         │
└─────────────────────────────────────────────────────────────────┘

1. Trainer clicks "Add Training" button

2. Fills event form:
   ├── Title
   ├── Type (Client/Internal)
   ├── Product(s) - Select from catalog
   ├── Date & Time
   ├── Duration
   ├── Location/Virtual Link
   ├── Expected Attendees
   └── Prerequisites

3. Saves event
   └── Option to copy event details for Outlook invite

4. Event appears in dashboard
   └── Status: "Planned"
```

### Flow 2: Bulk Event Import

```
┌─────────────────────────────────────────────────────────────────┐
│                    BULK EVENT IMPORT                             │
└─────────────────────────────────────────────────────────────────┘

1. User downloads CSV/Excel template
   └── Template includes all required fields with examples

2. User fills template with training data
   ├── Multiple events in rows
   ├── Products, trainers, dates, etc.
   └── Saves file

3. User uploads file to dashboard
   ├── System validates data format
   ├── Shows preview of events to be created
   └── Highlights any validation errors

4. User confirms import
   ├── Events created in bulk
   └── Status: "Planned" for all

5. User can review and edit individual events as needed
```

### Flow 3: Training Execution & Completion

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRAINING LIFECYCLE                            │
└─────────────────────────────────────────────────────────────────┘

PRE-TRAINING (T-24h to T-1h):
├── System sends reminder to trainer
├── System sends prerequisite checklist
└── Manager receives daily schedule notification

DURING TRAINING:
├── Status auto-updates to "Ongoing" at start time
└── Trainer can update attendee count

POST-TRAINING:
├── Trainer marks training as "Completed"
├── Enters actual duration and attendee count
├── Adds notes/observations
└── System triggers:
    ├── Feedback form generation
    ├── Feedback link distribution
    └── Summary generation queue

FEEDBACK COLLECTION (T+0 to T+7d):
├── Attendees receive feedback link
├── System sends reminders at T+1d, T+3d
└── Responses stored in database

SUMMARY GENERATION (T+24h):
├── System generates training summary
├── Trainer reviews and edits
├── Summary distributed to stakeholders
└── Event marked as "Closed"
```

### Flow 4: Reporting Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    REPORT GENERATION                             │
└─────────────────────────────────────────────────────────────────┘

1. User navigates to Reports section

2. Selects report type:
   ├── Standard Report (pre-built)
   └── Custom Report (build own)

3. Applies filters:
   ├── Date Range
   ├── Trainer(s)
   ├── Product(s)
   ├── Training Type
   └── Status

4. Generates report
   ├── View in browser
   ├── Export (PDF/Excel/CSV)
   └── Schedule for recurring generation

5. Share/Distribute
   ├── Email to stakeholders
   └── Download and share manually
```

---

## Technical Requirements

### Technology Stack (Recommended)

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | React.js with TypeScript | Modern, maintainable, rich ecosystem |
| **UI Framework** | Tailwind CSS + shadcn/ui | Fast development, consistent design |
| **Backend** | Node.js with Express | Lightweight, fast development, low resource usage |
| **Database** | SQLite (or PostgreSQL on RDS Free Tier) | Zero/minimal cost, sufficient for ~10 users |
| **Authentication** | Built-in Auth with JWT + RBAC | Simple user management, no external dependencies |
| **Calendar Integration** | Built-in calendar (Outlook via Graph API in Phase 2) | Native calendar, future Outlook sync |
| **Hosting** | AWS Lightsail ($3.50-$5/mo) or EC2 t3.micro (Free Tier eligible) | Minimal cost, sufficient for small team |
| **Email** | Amazon SES (Free Tier: 62K emails/mo from EC2) | Pay-per-use, negligible cost at low volume |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     USERS (~10)                                  │
│           (Trainers, Managers, Leadership)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              AWS LIGHTSAIL / EC2 t3.micro                        │
│                    (Single Instance)                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              FRONTEND (React SPA)                        │    │
│  │              Served via Node.js/Nginx                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              BACKEND (Node.js + Express)                 │    │
│  │   Auth │ Events │ Feedback │ Reports │ Notifications    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              DATABASE (SQLite file)                      │    │
│  │              Simple, zero-cost, easy backup              │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │   Amazon SES (Email)   │
                 │   Pay-per-use (~$0)    │
                 └────────────────────────┘

Estimated Monthly Cost: $3.50 - $10
```

---

## Integration Requirements

### Microsoft Outlook Integration (P2 - Future Enhancement)

**Purpose:** Automatically capture training events from Outlook calendar

**Note:** This integration requires Microsoft Entra ID (Azure AD) app registration and organizational approval. Given approval constraints, this is deferred to a future phase. Manual event entry will be the primary method for v1.0.

**Integration Method:** Microsoft Graph API (when approved)

**Scope:**
- Read calendar events for authorized users
- Detect events with training markers
- Two-way sync (optional): Update Outlook when dashboard event changes

**Requirements (for future implementation):**
- Microsoft Entra ID (Azure AD) app registration for Graph API access
- Delegated or application permissions
- User consent workflow
- Polling interval: 15 minutes (configurable)

**Event Detection Logic:**
```
Identify as Training if:
├── Subject contains "[Training]" OR
├── Subject contains "Training:" OR
├── Category is "Training" OR
└── Custom property is set
```

---

### Email Integration (P1)

**Purpose:** Send notifications, reminders, feedback links, summaries

**Requirements:**
- Amazon SES (Simple Email Service) or SMTP configuration
- HTML email templates
- Delivery tracking (optional)
- Unsubscribe handling

---

### Future Integrations (P3)

| System | Purpose | Priority |
|--------|---------|----------|
| Microsoft Teams | Notifications, bot integration | P3 |
| Power BI | Advanced analytics | P3 |
| SharePoint | Document storage | P3 |
| LMS (if acquired) | Data sync | P3 |

---

## Non-Functional Requirements

### Performance

| Metric | Target |
|--------|--------|
| Page Load Time | < 3 seconds |
| API Response Time | < 500ms (95th percentile) |
| Report Generation | < 30 seconds |
| Concurrent Users | 10 |
| Uptime | 99% (acceptable for internal tool) |

### Security

- Built-in authentication with JWT tokens
- Application-level role-based access control (RBAC)
- User roles: Admin, Training Head, Training Manager, Trainer
- Data encryption in transit (TLS/HTTPS)
- Application-level audit logging for sensitive operations
- Password hashing (bcrypt) for stored credentials
- Daily automated SQLite backup to S3 (with retention policy)

### Scalability

- Support for up to 10 users (trainers + managers)
- ~500 training events per year (sufficient for small team)
- ~2,000 feedback responses per year
- Vertical scaling sufficient (upgrade instance if needed)
- No complex infrastructure required

### Cost Considerations

**Target:** Minimize operational costs for a small internal team tool

| Component | Option | Estimated Monthly Cost |
|-----------|--------|------------------------|
| **Compute** | AWS Lightsail (512MB) | $3.50 |
| **Compute** | EC2 t3.micro (Free Tier first year) | $0 - $8.50 |
| **Database** | SQLite (file-based) | $0 |
| **Database** | RDS t3.micro (Free Tier first year) | $0 - $15 |
| **Email** | Amazon SES (Free Tier from EC2) | ~$0 |
| **Storage** | Included with instance | $0 |
| **SSL** | Let's Encrypt | $0 |

**Recommended Setup (Lowest Cost):**
- AWS Lightsail $3.50/mo instance
- SQLite database (file-based, included)
- Amazon SES for email (free tier sufficient)
- Let's Encrypt for SSL certificate
- **Total: ~$3.50 - $5/month**

**Cost Principles:**
- No managed services with minimum fees (avoid RDS, ElastiCache, etc.)
- Single instance deployment (no load balancers needed)
- SQLite eliminates database hosting costs
- Serverless email with SES (pay only for what you send)
- Manual backups to S3 (pennies per month)

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode

---

## Success Metrics & KPIs

### System Adoption

| Metric | Target | Measurement |
|--------|--------|-------------|
| User Adoption Rate | 90% of trainers active | Monthly active users / Total trainers |
| Event Capture Rate | 95% of trainings logged | Logged events / Actual trainings conducted |
| Bulk Import Usage | 50% of events via import | Imported events / Total events |

### Operational Efficiency

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to Create Event | < 2 minutes | Average event creation time |
| Report Generation Time | < 5 minutes (was 4+ hours) | Time from request to delivery |
| Feedback Response Rate | > 60% | Responses received / Forms sent |

### Data Quality

| Metric | Target | Measurement |
|--------|--------|-------------|
| Event Completion Rate | 95% | Completed events / Planned events |
| Feedback Collection Rate | 80% | Trainings with feedback / Total trainings |
| Data Accuracy | 99% | Verified correct entries |

### Business Impact

| Metric | Target | Measurement |
|--------|--------|-------------|
| Trainer Utilization Visibility | 100% | Trainers with utilization data |
| Management Query Response | < 1 hour | Time to answer training queries |
| Planning Accuracy | 90% | Executed vs planned trainings |

---

## Out of Scope (v1.0)

The following are explicitly **not included** in the initial release:

1. **Learning Management Features**
   - Course content hosting
   - E-learning module delivery
   - Assessment/quiz functionality
   - Certification management

2. **Advanced Resource Management**
   - Automated scheduling optimization
   - AI-based trainer recommendations
   - Conflict resolution automation

3. **External Integrations**
   - Third-party LMS integration
   - CRM integration
   - HRIS integration

4. **Mobile Application**
   - Native iOS/Android apps (responsive web only)

5. **Advanced Analytics**
   - Predictive analytics
   - Machine learning insights
   - Advanced forecasting

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Low User Adoption** | Medium | High | Early user involvement, training sessions, intuitive UX |
| **Manual Data Entry Burden** | Medium | Medium | Bulk CSV/Excel import, intuitive forms, quick-add features |
| **Data Migration** | Low | Medium | Start fresh, import historical data in phases |
| **Scope Creep** | High | Medium | Strict MVP definition, phased rollout |
| **Performance Issues** | Low | High | Load testing, scalable architecture |
| **Security Concerns** | Low | High | JWT authentication, RBAC, security best practices, HTTPS |

---

## Future Considerations (Post v1.0)

### Phase 2 Enhancements
- Microsoft Outlook calendar integration (via Graph API, requires org approval)
- Microsoft Teams bot for quick updates
- Mobile-responsive optimizations
- Advanced calendar features (resource booking)
- Custom dashboard widgets

### Phase 3 Enhancements
- AI-powered insights and recommendations
- Predictive analytics for resource planning
- Integration with HR systems
- Multi-language support

### Phase 4 Enhancements
- Native mobile applications
- Advanced gamification (trainer leaderboards)
- Client portal for external stakeholders
- Integration with potential future LMS

---

## Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| **Training Event** | A scheduled session where a trainer delivers content to attendees |
| **Client Training** | Training conducted for external clients/customers |
| **Internal Training** | Training conducted for internal employees |
| **Utilization Rate** | Percentage of available time spent on productive activities |
| **Feedback Form** | Post-training survey to collect attendee feedback |

### B. Reference Documents

- AWS Lightsail Documentation
- Amazon SES Developer Guide
- SQLite Documentation
- Company Training Policy Documents

### C. Stakeholder Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Training Head | | | |
| IT Lead | | | |
| Project Sponsor | | | |

---

*Document Version History*

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 19, 2026 | Training Team | Initial draft |
| 1.1 | Feb 20, 2026 | Training Team | Updated infrastructure from Azure to AWS; simplified auth to built-in RBAC; deferred Outlook integration to Phase 2; optimized for minimal cost (~10 users) |

---

**End of Document**
