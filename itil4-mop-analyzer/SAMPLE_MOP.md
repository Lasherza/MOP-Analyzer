# Sample Method of Procedure (MOP) Template

This is a sample MOP template that demonstrates the structure the analyzer looks for. You can use this as a reference for creating your own MOPs.

---

## Change Details

**Change ID:** CHG-2024-0001  
**Category:** IT Infrastructure  
**Priority:** Medium  
**Change Window:** 2024-02-15, 02:00 AM - 06:00 AM EST  
**Requestor:** John Doe  
**Implementer:** Jane Smith  

---

## Change Description

Upgrade the production database server from PostgreSQL 13.x to PostgreSQL 15.x to improve performance and security. This upgrade includes database backup, software installation, data migration, and validation testing.

---

## Pre-Checks

### 1. Environment Verification

- [ ] Verify current PostgreSQL version: `psql --version`
- [ ] Confirm database server status is healthy
- [ ] Check available disk space (minimum 50GB free)
- [ ] Verify CPU and memory utilization is below 70%
- [ ] Confirm no other maintenance windows overlap

### 2. Backup Verification

- [ ] Confirm latest backup completed successfully
- [ ] Verify backup integrity with test restore
- [ ] Document backup location and timestamp
- [ ] Validate backup size matches expected database size
- [ ] Confirm backup retention policy compliance

### 3. Prerequisites

- [ ] PostgreSQL 15.x installation package downloaded and verified
- [ ] Database connection strings documented
- [ ] All dependent applications identified
- [ ] Application owners notified 24 hours in advance
- [ ] Maintenance window approved by Change Advisory Board (CAB)

### 4. Access and Permissions

- [ ] Confirm root/sudo access to database server
- [ ] Verify database administrator credentials
- [ ] Test VPN/remote access if working remotely
- [ ] Confirm access to monitoring tools

### 5. Stakeholder Communication

- [ ] Send notification to all affected users
- [ ] Post maintenance notice on status page
- [ ] Confirm emergency contact list is current
- [ ] Establish communication channel (e.g., Slack, Teams)

### 6. Risk Assessment

**Identified Risks:**
- Data loss during migration
- Extended downtime beyond maintenance window
- Application compatibility issues
- Performance degradation after upgrade

**Mitigation Strategies:**
- Verified backups and tested restore procedures
- Allocated buffer time in maintenance window
- Pre-tested upgrade in staging environment
- Performance baseline documented for comparison

---

## Operation Steps

### Phase 1: Preparation (15 minutes)

**Step 1.1:** Announce maintenance start
```bash
# Send notification to operations channel
echo "Database maintenance starting at $(date)" | mail -s "DB Maintenance Start" ops@company.com
```

**Step 1.2:** Stop application services
```bash
# Stop application servers
sudo systemctl stop app-server-1
sudo systemctl stop app-server-2
sudo systemctl stop app-server-3

# Verify services stopped
sudo systemctl status app-server-*
```
**Expected Output:** All services should show "inactive (dead)"

**Validation:** Verify no active database connections:
```sql
SELECT count(*) FROM pg_stat_activity WHERE datname = 'production_db';
```
**Expected Result:** Count should be 0 or only maintenance connections

### Phase 2: Final Backup (20 minutes)

**Step 2.1:** Create pre-upgrade backup
```bash
# Create timestamped backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres -Fc production_db > /backups/production_db_pre_upgrade_$TIMESTAMP.dump

# Verify backup file created
ls -lh /backups/production_db_pre_upgrade_$TIMESTAMP.dump
```
**Expected Output:** File size should be approximately 2.5GB

**Step 2.2:** Document baseline performance metrics
```bash
# Capture current database size
psql -U postgres -d production_db -c "SELECT pg_size_pretty(pg_database_size('production_db'));"

# Document table counts
psql -U postgres -d production_db -c "SELECT schemaname, count(*) FROM pg_tables GROUP BY schemaname;"
```

### Phase 3: Database Upgrade (60 minutes)

**Step 3.1:** Stop PostgreSQL 13
```bash
sudo systemctl stop postgresql-13
sudo systemctl disable postgresql-13
```

**Step 3.2:** Install PostgreSQL 15
```bash
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15

# Verify installation
/usr/lib/postgresql/15/bin/postgres --version
```

**Step 3.3:** Initialize new database cluster
```bash
sudo -u postgres /usr/lib/postgresql/15/bin/initdb -D /var/lib/postgresql/15/main
```

**Step 3.4:** Migrate data using pg_upgrade
```bash
sudo -u postgres /usr/lib/postgresql/15/bin/pg_upgrade \
  -b /usr/lib/postgresql/13/bin \
  -B /usr/lib/postgresql/15/bin \
  -d /var/lib/postgresql/13/main \
  -D /var/lib/postgresql/15/main
```

**Expected Output:** "Upgrade Complete" message

**Step 3.5:** Start PostgreSQL 15
```bash
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15
```

### Phase 4: Validation (30 minutes)

**Step 4.1:** Verify database accessibility
```bash
psql -U postgres -d production_db -c "SELECT version();"
```
**Expected Output:** Should show PostgreSQL 15.x

**Step 4.2:** Validate data integrity
```bash
# Check table counts match pre-upgrade
psql -U postgres -d production_db -c "SELECT schemaname, count(*) FROM pg_tables GROUP BY schemaname;"

# Run consistency checks
psql -U postgres -d production_db -c "SELECT * FROM verify_data_integrity();"
```

**Step 4.3:** Performance validation
```bash
# Run standard performance test queries
psql -U postgres -d production_db -f /scripts/performance_test.sql

# Compare with baseline metrics
```

**Step 4.4:** Test application connectivity
```bash
# Test from application server
psql -h db-server -U app_user -d production_db -c "SELECT 1;"
```

### Phase 5: Service Restoration (15 minutes)

**Step 5.1:** Start application services
```bash
sudo systemctl start app-server-1
sudo systemctl start app-server-2
sudo systemctl start app-server-3

# Verify services started
sudo systemctl status app-server-*
```

**Step 5.2:** Monitor application logs
```bash
tail -f /var/log/application/*.log
```
Look for successful database connections and no errors

**Step 5.3:** Perform smoke tests
- [ ] User login functionality
- [ ] Data retrieval operations
- [ ] Data write operations
- [ ] Report generation
- [ ] API endpoints responding

### Phase 6: Post-Implementation (15 minutes)

**Step 6.1:** Document completion
- Record actual completion time
- Document any deviations from plan
- Save all command outputs

**Step 6.2:** Announce completion
```bash
echo "Database maintenance completed successfully at $(date)" | mail -s "DB Maintenance Complete" ops@company.com
```

**Step 6.3:** Update monitoring
- Verify monitoring dashboards showing healthy status
- Check alerting is functioning
- Update documentation with new version

---

## Rollback Steps

### Rollback Decision Criteria

Initiate rollback if any of the following occur:
- Data integrity check fails
- Application cannot connect to database after 30 minutes
- Performance degradation exceeds 20% of baseline
- Critical errors in application logs
- Unable to complete upgrade within maintenance window

### Rollback Procedure (45 minutes)

**Step R1:** Stop all application services
```bash
sudo systemctl stop app-server-1
sudo systemctl stop app-server-2
sudo systemctl stop app-server-3
```

**Step R2:** Stop PostgreSQL 15
```bash
sudo systemctl stop postgresql-15
sudo systemctl disable postgresql-15
```

**Step R3:** Restore PostgreSQL 13
```bash
# Re-enable PostgreSQL 13
sudo systemctl enable postgresql-13
sudo systemctl start postgresql-13

# Verify PostgreSQL 13 is running
sudo systemctl status postgresql-13
```

**Step R4:** Restore from backup
```bash
# Drop the database (if exists)
psql -U postgres -c "DROP DATABASE IF EXISTS production_db;"

# Recreate database
psql -U postgres -c "CREATE DATABASE production_db;"

# Restore from pre-upgrade backup
pg_restore -U postgres -d production_db /backups/production_db_pre_upgrade_*.dump

# Verify restore completed
psql -U postgres -d production_db -c "SELECT count(*) FROM pg_tables;"
```

**Expected Output:** Table count should match pre-upgrade count

**Step R5:** Validate rollback
```bash
# Verify database version
psql -U postgres -c "SELECT version();"

# Test database connectivity
psql -U postgres -d production_db -c "SELECT 1;"

# Run data integrity checks
psql -U postgres -d production_db -c "SELECT * FROM verify_data_integrity();"
```

**Step R6:** Restart application services
```bash
sudo systemctl start app-server-1
sudo systemctl start app-server-2
sudo systemctl start app-server-3

# Verify services
sudo systemctl status app-server-*
```

**Step R7:** Verify application functionality
- [ ] Test user login
- [ ] Verify data retrieval
- [ ] Check application logs for errors
- [ ] Confirm all services operational

**Step R8:** Communication
```bash
# Notify stakeholders of rollback
echo "Database upgrade rolled back. System restored to PostgreSQL 13 at $(date)" | \
  mail -s "DB Maintenance Rollback Complete" ops@company.com
```

**Step R9:** Post-rollback actions
- Document reason for rollback
- Schedule post-mortem meeting
- Update change ticket with rollback details
- Plan revised upgrade attempt

---

## Post-Implementation Validation

### Immediate Validation (0-2 hours)
- [ ] All application services running
- [ ] No error alerts in monitoring
- [ ] User access confirmed functional
- [ ] Performance metrics within acceptable range

### Extended Validation (2-24 hours)
- [ ] Monitor database performance trends
- [ ] Review application error logs
- [ ] Confirm batch jobs running successfully
- [ ] Validate backup procedures with new version

### Follow-up Actions
- [ ] Schedule 1-week post-implementation review
- [ ] Update runbooks and documentation
- [ ] Archive this MOP with actual completion notes
- [ ] Share lessons learned with team

---

## Emergency Contacts

**Primary Contact:** Jane Smith - jane.smith@company.com - +1-555-0100  
**Secondary Contact:** John Doe - john.doe@company.com - +1-555-0101  
**Database Team Lead:** Mike Johnson - mike.johnson@company.com - +1-555-0102  
**Operations Manager:** Sarah Williams - sarah.williams@company.com - +1-555-0103  

**Escalation Path:**
1. Database Administrator (0-15 min)
2. Database Team Lead (15-30 min)
3. Operations Manager (30-60 min)
4. CTO (60+ min or critical issues)

---

## Notes

- This MOP has been reviewed and approved by CAB on 2024-02-08
- Tested successfully in staging environment on 2024-02-12
- Estimated total execution time: 2.5 - 3 hours
- Allocated maintenance window: 4 hours (with 1-hour buffer)

---

**Document Version:** 1.0  
**Created:** 2024-02-01  
**Last Updated:** 2024-02-08  
**Approved By:** Change Advisory Board
