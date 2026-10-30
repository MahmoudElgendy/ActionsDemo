import { useEffect, useState, type FormEvent } from 'react'
import {
  Activity,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CirclePlus,
  Edit3,
  Filter,
  LayoutDashboard,
  LoaderCircle,
  Mail,
  Search,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react'
import './directory.css'

type Employee = {
  id: number
  firstName: string
  lastName: string
  email: string
  department: string
  jobTitle: string
  hireDate: string
}

type EmployeeInput = Omit<Employee, 'id'>

const emptyEmployee = (): EmployeeInput => ({
  firstName: '',
  lastName: '',
  email: '',
  department: '',
  jobTitle: '',
  hireDate: new Date().toISOString().slice(0, 10),
})
const renderDate = new Date()

async function getErrorMessage(response: Response) {
  const body = await response.json().catch(() => ({})) as {
    detail?: string
    title?: string
    errors?: Record<string, string[]>
  }
  const validationMessages = body.errors ? Object.values(body.errors).flat().join(' ') : ''
  return body.detail || validationMessages || body.title || `Request failed (${response.status}).`
}

function initials(employee: Employee) {
  return `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`.toUpperCase()
}

function formatHireDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function departmentTone(value: string) {
  const department = value.toLowerCase()
  if (department.includes('engineer')) return 'green'
  if (department.includes('research')) return 'orange'
  if (department.includes('security')) return 'blue'
  return 'neutral'
}

function App() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All departments')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [form, setForm] = useState<EmployeeInput>(emptyEmployee)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadEmployees() {
      try {
        const response = await fetch('/api/employees', { signal: controller.signal })
        if (!response.ok) throw new Error(await getErrorMessage(response))
        setEmployees(await response.json() as Employee[])
        setLoadError('')
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          setLoadError(error.message)
        }
      } finally {
        setLoading(false)
      }
    }

    void loadEmployees()
    return () => controller.abort()
  }, [])

  const departments = [...new Set(employees.map((employee) => employee.department))].sort()
  const normalizedQuery = query.trim().toLowerCase()
  const filteredEmployees = employees.filter((employee) => {
    const matchesQuery = !normalizedQuery ||
      `${employee.firstName} ${employee.lastName} ${employee.email} ${employee.jobTitle} ${employee.department}`
        .toLowerCase()
        .includes(normalizedQuery)
    const matchesDepartment = departmentFilter === 'All departments' || employee.department === departmentFilter
    return matchesQuery && matchesDepartment
  })
  const currentYear = renderDate.getFullYear()
  const recentHires = employees.filter((employee) => employee.hireDate.slice(0, 4) === String(currentYear)).length

  function openCreateDialog() {
    setEditingEmployee(null)
    setForm(emptyEmployee())
    setFormError('')
    setDialogOpen(true)
  }

  function openEditDialog(employee: Employee) {
    const { id: _id, ...employeeInput } = employee
    setEditingEmployee(employee)
    setForm(employeeInput)
    setFormError('')
    setDialogOpen(true)
  }

  async function saveEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setFormError('')

    try {
      const response = await fetch(
        editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees',
        {
          method: editingEmployee ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      )
      if (!response.ok) throw new Error(await getErrorMessage(response))
      const savedEmployee = await response.json() as Employee
      setEmployees((current) => editingEmployee
        ? current.map((employee) => employee.id === savedEmployee.id ? savedEmployee : employee)
        : [savedEmployee, ...current])
      setDialogOpen(false)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save this employee.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!employeeToDelete) return
    setDeleting(true)
    setDeleteError('')

    try {
      const response = await fetch(`/api/employees/${employeeToDelete.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(await getErrorMessage(response))
      setEmployees((current) => current.filter((employee) => employee.id !== employeeToDelete.id))
      setEmployeeToDelete(null)
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Unable to delete this employee.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#directory" aria-label="Team Ledger home">
          <span className="brand-mark"><UsersRound size={20} strokeWidth={2.2} /></span>
          <span className="brand-name">team<span>ledger</span></span>
        </a>

        <div className="workspace-switcher">
          <span className="workspace-monogram">AC</span>
          <span className="workspace-copy"><strong>Atlas Creative</strong><small>People workspace</small></span>
          <ChevronDown size={15} aria-hidden="true" />
        </div>

        <div className="sidebar-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          <a className="nav-item nav-item-active" href="#directory" aria-current="page">
            <LayoutDashboard size={17} />
            <span>Directory</span>
            <span className="nav-count">{employees.length}</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className={`connection-status${loadError ? ' connection-offline' : ''}`}>
            <span className="connection-dot" />
            <span>{loadError ? 'API unavailable' : loading ? 'Connecting' : 'API connected'}</span>
          </div>
          <div className="sidebar-account">
            <span className="account-avatar">JD</span>
            <span><strong>Jordan Davis</strong><small>Administrator</small></span>
            <ChevronDown size={14} />
          </div>
        </div>
      </aside>

      <main className="main-content" id="directory">
        <header className="topbar">
          <div className="breadcrumbs"><span>People</span><span className="breadcrumb-divider">/</span><strong>Directory</strong></div>
          <div className="topbar-meta"><span className="topbar-date">{renderDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span><span className="topbar-avatar">JD</span></div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <p className="eyebrow">PEOPLE OPERATIONS <span>—</span> 01</p>
              <h1>Employee directory</h1>
              <p className="page-subtitle">A clear view of the people behind the work.</p>
            </div>
            <button type="button" className="button button-primary" onClick={openCreateDialog}>
              <CirclePlus size={17} />
              <span>Add employee</span>
            </button>
          </section>

          {loadError && (
            <div className="alert-banner" role="alert">
              <Activity size={17} />
              <span>{loadError}</span>
              <button type="button" className="text-button" onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}

          <section className="summary-strip" aria-label="Directory summary">
            <div className="summary-item"><span className="summary-icon summary-icon-green"><UsersRound size={17} /></span><span className="summary-label">TEAM MEMBERS</span><strong>{loading ? '—' : employees.length.toString().padStart(2, '0')}</strong></div>
            <div className="summary-divider" />
            <div className="summary-item"><span className="summary-icon summary-icon-orange"><BriefcaseBusiness size={17} /></span><span className="summary-label">DEPARTMENTS</span><strong>{loading ? '—' : departments.length.toString().padStart(2, '0')}</strong></div>
            <div className="summary-divider" />
            <div className="summary-item"><span className="summary-icon summary-icon-blue"><CalendarDays size={17} /></span><span className="summary-label">JOINED THIS YEAR</span><strong>{loading ? '—' : recentHires.toString().padStart(2, '0')}</strong></div>
            <div className="summary-note"><span className="note-mark" />Updated from your live directory</div>
          </section>

          <section className="directory-section" aria-labelledby="directory-title">
            <div className="section-heading">
              <div><h2 id="directory-title">All employees</h2><span className="result-count">{filteredEmployees.length} {filteredEmployees.length === 1 ? 'person' : 'people'}</span></div>
              <div className="directory-controls">
                <label className="search-field">
                  <Search size={16} aria-hidden="true" />
                  <span className="sr-only">Search employees</span>
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people" />
                  {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={14} /></button>}
                </label>
                <label className="filter-field">
                  <Filter size={15} aria-hidden="true" />
                  <span className="sr-only">Filter by department</span>
                  <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
                    <option>All departments</option>
                    {departments.map((department) => <option key={department}>{department}</option>)}
                  </select>
                  <ChevronDown size={14} aria-hidden="true" />
                </label>
              </div>
            </div>

            <div className="table-scroll">
              <table className="employee-table">
                <thead><tr><th scope="col">EMPLOYEE</th><th scope="col">DEPARTMENT</th><th scope="col">JOB TITLE</th><th scope="col">HIRE DATE</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {loading && <tr><td className="table-message" colSpan={5}><LoaderCircle className="spin" size={19} />Loading employees</td></tr>}
                  {!loading && filteredEmployees.map((employee, index) => (
                    <tr key={employee.id} style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}>
                      <td><div className="person-cell"><span className={`employee-avatar avatar-${index % 5}`}>{initials(employee)}</span><span className="person-copy"><strong>{employee.firstName} {employee.lastName}</strong><span>{employee.email}</span></span></div></td>
                      <td><span className={`department-tag department-${departmentTone(employee.department)}`}>{employee.department}</span></td>
                      <td className="job-title-cell">{employee.jobTitle}</td>
                      <td><span className="hire-date"><CalendarDays size={14} />{formatHireDate(employee.hireDate)}</span></td>
                      <td><div className="row-actions"><button type="button" className="icon-button" aria-label={`Edit ${employee.firstName} ${employee.lastName}`} title="Edit employee" onClick={() => openEditDialog(employee)}><Edit3 size={16} /></button><button type="button" className="icon-button icon-button-danger" aria-label={`Delete ${employee.firstName} ${employee.lastName}`} title="Delete employee" onClick={() => { setEmployeeToDelete(employee); setDeleteError('') }}><Trash2 size={16} /></button></div></td>
                    </tr>
                  ))}
                  {!loading && filteredEmployees.length === 0 && (
                    <tr><td colSpan={5}><div className="empty-state"><span className="empty-icon"><UsersRound size={22} /></span><strong>{employees.length ? 'No matching employees' : 'Your directory is empty'}</strong><span>{employees.length ? 'Try another search or department.' : 'Add your first employee to get started.'}</span>{!employees.length && <button type="button" className="button button-secondary" onClick={openCreateDialog}><CirclePlus size={16} />Add employee</button>}</div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-footer"><span>Showing <strong>{filteredEmployees.length}</strong> of <strong>{employees.length}</strong> employees</span><span className="footer-mark"><Check size={14} />All changes saved</span></div>
          </section>

          <footer className="page-footer"><span>TEAM LEDGER <span className="footer-slash">/</span> PEOPLE</span><span>Employee records are managed by your workspace.</span></footer>
        </div>
      </main>

      {dialogOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialogOpen(false) }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="employee-dialog-title">
            <header className="modal-header">
              <div><span className="modal-kicker">PEOPLE RECORD</span><h2 id="employee-dialog-title">{editingEmployee ? 'Edit employee' : 'Add employee'}</h2></div>
              <button type="button" className="icon-button modal-close" aria-label="Close dialog" onClick={() => setDialogOpen(false)}><X size={18} /></button>
            </header>
            <form onSubmit={saveEmployee}>
              <div className="modal-fields">
                <label className="form-field"><span>First name</span><input autoFocus required maxLength={100} value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></label>
                <label className="form-field"><span>Last name</span><input required maxLength={100} value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></label>
                <label className="form-field field-full"><span>Work email</span><span className="input-with-icon"><Mail size={15} /><input type="email" required maxLength={256} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></span></label>
                <label className="form-field"><span>Department</span><input required maxLength={100} value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} /></label>
                <label className="form-field"><span>Job title</span><input required maxLength={100} value={form.jobTitle} onChange={(event) => setForm({ ...form, jobTitle: event.target.value })} /></label>
                <label className="form-field field-full"><span>Hire date</span><span className="input-with-icon"><CalendarDays size={15} /><input type="date" required value={form.hireDate} onChange={(event) => setForm({ ...form, hireDate: event.target.value })} /></span></label>
              </div>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <footer className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setDialogOpen(false)}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />}{saving ? 'Saving' : editingEmployee ? 'Save changes' : 'Add employee'}</button></footer>
            </form>
          </section>
        </div>
      )}

      {employeeToDelete && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEmployeeToDelete(null) }}>
          <section className="modal delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title">
            <span className="delete-icon"><Trash2 size={19} /></span>
            <h2 id="delete-dialog-title">Remove employee?</h2>
            <p>This will permanently remove <strong>{employeeToDelete.firstName} {employeeToDelete.lastName}</strong> from the directory.</p>
            {deleteError && <p className="form-error" role="alert">{deleteError}</p>}
            <footer className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setEmployeeToDelete(null)}>Cancel</button><button type="button" className="button button-delete" disabled={deleting} onClick={confirmDelete}>{deleting ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={16} />}{deleting ? 'Removing' : 'Remove employee'}</button></footer>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
