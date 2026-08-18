import React, { useEffect, useState, useCallback } from "react";
import { Page, Card, IndexTable, EmptyState, Modal, FormLayout, Select, Toast, Frame, Spinner, Badge, Button, Box, BlockStack } from "@shopify/polaris";
import { api } from "../api";

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.get("/api/enrollments"), api.get("/api/students"), api.get("/api/courses")])
      .then(([e, s, c]) => { setEnrollments(e); setStudents(s); setCourses(c); })
      .catch((err) => setToast(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleEnroll() {
    if (!studentId || !courseId) { setError("Please select both a student and a course"); return; }
    
    setIsSaving(true);
    try {
      await api.post("/api/enrollments", { studentId, courseId });
      setToast("Student enrolled");
      setModalOpen(false);
      setStudentId(""); setCourseId(""); setError("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleStatus(enr) {
    const newStatus = enr.status === "Completed" ? "In Progress" : "Completed";
    try {
      await api.patch(`/api/enrollments/${enr._id}`, { status: newStatus });
      setToast(`Marked as ${newStatus}`);
      load();
    } catch (err) {
      setToast(err.message);
    }
  }

  const rowMarkup = enrollments.map((e, index) => (
    <IndexTable.Row id={e._id} key={e._id} position={index}>
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">{e.student?.name}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{e.course?.title}</IndexTable.Cell>
      <IndexTable.Cell>
        {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(e.enrollmentDate))}
      </IndexTable.Cell>
      <IndexTable.Cell><Badge tone={e.status === "Completed" ? "success" : "attention"}>{e.status}</Badge></IndexTable.Cell>
      <IndexTable.Cell><Button size="slim" onClick={() => toggleStatus(e)}>Mark as {e.status === "Completed" ? "In Progress" : "Completed"}</Button></IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Frame>
      <Page title="Enrollments" subtitle="Track student progress" primaryAction={{ content: "Enroll student", onAction: () => { setError(""); setModalOpen(true); } }}>
        <Card padding="0">
          {loading ? (
            <Box padding="800">
              <BlockStack inlineAlign="center"><Spinner /></BlockStack>
            </Box>
          ) : enrollments.length === 0 ? (
            <EmptyState 
              heading="No enrollments yet" 
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>Enroll a student in a course to get started.</p>
            </EmptyState>
          ) : (
            <IndexTable resourceName={{ singular: "enrollment", plural: "enrollments" }} itemCount={enrollments.length}
              headings={[{ title: "Student" }, { title: "Course" }, { title: "Enrolled On" }, { title: "Status" }, { title: "Actions" }]} selectable={false}>
              {rowMarkup}
            </IndexTable>
          )}
        </Card>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Enroll student"
          primaryAction={{ content: "Enroll", onAction: handleEnroll, loading: isSaving }}
          secondaryActions={[{ content: "Cancel", onAction: () => setModalOpen(false), disabled: isSaving }]}>
          <Modal.Section>
            <FormLayout>
              <Select label="Student" options={[{ label: "Select a student", value: "" }, ...students.map((s) => ({ label: `${s.name} (${s.email})`, value: s._id }))]} value={studentId} onChange={setStudentId} />
              <Select label="Course" options={[{ label: "Select a course", value: "" }, ...courses.map((c) => ({ label: c.title, value: c._id }))]} value={courseId} onChange={setCourseId} />
              {error && <p style={{ color: "red" }}>{error}</p>}
            </FormLayout>
          </Modal.Section>
        </Modal>

        {toast && <Toast content={toast} onDismiss={() => setToast("")} />}
      </Page>
    </Frame>
  );
}
