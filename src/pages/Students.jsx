import React, { useEffect, useState, useCallback } from "react";
import { Page, Card, IndexTable, EmptyState, Modal, FormLayout, TextField, Toast, Frame, Spinner, Button, Badge, Text, InlineGrid, BlockStack, Box } from "@shopify/polaris";
import { api } from "../api";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState("");

  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);
  const [studentCourses, setStudentCourses] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  async function openDashboard(student) {
    setActiveStudent(student);
    setDashboardOpen(true);
    setDashboardLoading(true);
    try {
      const courses = await api.get(`/api/students/${student._id}/courses`);
      setStudentCourses(courses);
    } catch (err) {
      setToast("Failed to load student dashboard");
    } finally {
      setDashboardLoading(false);
    }
  }

  const load = useCallback(() => {
    setLoading(true);
    api.get("/api/students").then(setStudents).catch((err) => setToast(err.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Valid email is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    try {
      await api.post("/api/students", form);
      setToast("Student added");
      setModalOpen(false);
      setForm({ name: "", email: "" });
      load();
    } catch (err) {
      setToast(err.message);
    }
  }

  const rowMarkup = students.map((s, index) => (
    <IndexTable.Row id={s._id} key={s._id} position={index}>
      <IndexTable.Cell>{s.name}</IndexTable.Cell>
      <IndexTable.Cell>{s.email}</IndexTable.Cell>
      <IndexTable.Cell>
        <Button size="slim" onClick={() => openDashboard(s)}>View Dashboard</Button>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Frame>
      <Page title="Students" subtitle="Manage your learners" primaryAction={{ content: "Add student", onAction: () => { setForm({ name: "", email: "" }); setErrors({}); setModalOpen(true); } }}>
        <Card padding="0">
          {loading ? (
            <Box padding="800">
              <BlockStack inlineAlign="center"><Spinner /></BlockStack>
            </Box>
          ) : students.length === 0 ? (
            <EmptyState heading="No students yet" image=""><p>Add your first student to get started.</p></EmptyState>
          ) : (
            <IndexTable resourceName={{ singular: "student", plural: "students" }} itemCount={students.length} headings={[{ title: "Name" }, { title: "Email" }, { title: "Actions" }]} selectable={false}>
              {rowMarkup}
            </IndexTable>
          )}
        </Card>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add student"
          primaryAction={{ content: "Save", onAction: handleSave }}
          secondaryActions={[{ content: "Cancel", onAction: () => setModalOpen(false) }]}>
          <Modal.Section>
            <FormLayout>
              <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} error={errors.name} autoComplete="off" />
              <TextField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={errors.email} type="email" autoComplete="off" />
            </FormLayout>
          </Modal.Section>
        </Modal>

        <Modal open={dashboardOpen} onClose={() => setDashboardOpen(false)} title={activeStudent ? `${activeStudent.name}'s Dashboard` : "Student Dashboard"} size="large">
          <Modal.Section>
            <InlineGrid columns={2} gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text variant="headingLg" as="p">{studentCourses.length}</Text>
                  <Text tone="subdued" as="p">Total Enrollments</Text>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="200">
                  <Text variant="headingLg" as="p">{studentCourses.filter(c => c.status === "Completed").length}</Text>
                  <Text tone="subdued" as="p">Completed</Text>
                </BlockStack>
              </Card>
            </InlineGrid>
            
            <Box paddingBlockStart="400">
              {dashboardLoading ? (
                <Spinner />
              ) : studentCourses.length === 0 ? (
                <EmptyState heading="No enrollments" image=""><p>This student is not enrolled in any courses.</p></EmptyState>
              ) : (
                <IndexTable resourceName={{ singular: "course", plural: "courses" }} itemCount={studentCourses.length} headings={[{ title: "Course" }, { title: "Enrolled On" }, { title: "Status" }]} selectable={false}>
                  {studentCourses.map((e, index) => (
                    <IndexTable.Row id={e.enrollmentId} key={e.enrollmentId} position={index}>
                      <IndexTable.Cell>{e.course?.title}</IndexTable.Cell>
                      <IndexTable.Cell>{new Date(e.enrollmentDate).toLocaleDateString()}</IndexTable.Cell>
                      <IndexTable.Cell><Badge tone={e.status === "Completed" ? "success" : "attention"}>{e.status}</Badge></IndexTable.Cell>
                    </IndexTable.Row>
                  ))}
                </IndexTable>
              )}
            </Box>
          </Modal.Section>
        </Modal>

        {toast && <Toast content={toast} onDismiss={() => setToast("")} />}
      </Page>
    </Frame>
  );
}
