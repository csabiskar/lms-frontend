import React, { useEffect, useState, useCallback } from "react";
import { Page, Card, IndexTable, EmptyState, Modal, FormLayout, TextField, Select, Toast, Frame, Spinner, Badge } from "@shopify/polaris";
import { api } from "../api";

const emptyForm = { title: "", description: "", instructorName: "", category: "", duration: "", status: "Active" };

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/api/courses").then(setCourses).catch((err) => setToast(err.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setForm(emptyForm); setErrors({}); setEditingId(null); setModalOpen(true);
  }
  function openEdit(course) {
    setForm({ ...course }); setErrors({}); setEditingId(course._id); setModalOpen(true);
  }

  async function handleSave() {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.instructorName.trim()) newErrors.instructorName = "Instructor name is required";
    if (!form.category.trim()) newErrors.category = "Category is required";
    if (!form.duration.trim()) newErrors.duration = "Duration is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    try {
      if (editingId) {
        await api.put(`/api/courses/${editingId}`, form);
        setToast("Course updated");
      } else {
        await api.post("/api/courses", form);
        setToast("Course created");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setToast(err.message);
    }
  }

  async function handleDelete() {
    try {
      await api.del(`/api/courses/${deleteId}`);
      setToast("Course deleted");
      setDeleteId(null);
      load();
    } catch (err) {
      setToast(err.message);
    }
  }

  const rowMarkup = courses.map((c, index) => (
    <IndexTable.Row id={c._id} key={c._id} position={index}>
      <IndexTable.Cell>{c.title}</IndexTable.Cell>
      <IndexTable.Cell>{c.instructorName}</IndexTable.Cell>
      <IndexTable.Cell>{c.category}</IndexTable.Cell>
      <IndexTable.Cell>{c.duration}</IndexTable.Cell>
      <IndexTable.Cell><Badge tone={c.status === "Active" ? "success" : "critical"}>{c.status}</Badge></IndexTable.Cell>
      <IndexTable.Cell>
        <button onClick={() => openEdit(c)}>Edit</button>{" "}
        <button onClick={() => setDeleteId(c._id)}>Delete</button>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Frame>
      <Page title="Courses" primaryAction={{ content: "Add course", onAction: openCreate }}>
        <Card>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center" }}><Spinner /></div>
          ) : courses.length === 0 ? (
            <EmptyState heading="No courses yet" action={{ content: "Add course", onAction: openCreate }} image="">
              <p>Create your first course to get started.</p>
            </EmptyState>
          ) : (
            <IndexTable
              resourceName={{ singular: "course", plural: "courses" }}
              itemCount={courses.length}
              headings={[{ title: "Title" }, { title: "Instructor" }, { title: "Category" }, { title: "Duration" }, { title: "Status" }, { title: "Actions" }]}
              selectable={false}
            >
              {rowMarkup}
            </IndexTable>
          )}
        </Card>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit course" : "Add course"}
          primaryAction={{ content: "Save", onAction: handleSave }}
          secondaryActions={[{ content: "Cancel", onAction: () => setModalOpen(false) }]}>
          <Modal.Section>
            <FormLayout>
              <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} error={errors.title} autoComplete="off" />
              <TextField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} error={errors.description} multiline={3} autoComplete="off" />
              <TextField label="Instructor Name" value={form.instructorName} onChange={(v) => setForm({ ...form, instructorName: v })} error={errors.instructorName} autoComplete="off" />
              <TextField label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} error={errors.category} autoComplete="off" />
              <TextField label="Duration" value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} error={errors.duration} placeholder="e.g. 4 weeks" autoComplete="off" />
              <Select label="Status" options={[{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }]} value={form.status} onChange={(v) => setForm({ ...form, status: v })} />
            </FormLayout>
          </Modal.Section>
        </Modal>

        <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete course?"
          primaryAction={{ content: "Delete", destructive: true, onAction: handleDelete }}
          secondaryActions={[{ content: "Cancel", onAction: () => setDeleteId(null) }]}>
          <Modal.Section><p>This will also remove any enrollments tied to this course. This cannot be undone.</p></Modal.Section>
        </Modal>

        {toast && <Toast content={toast} onDismiss={() => setToast("")} />}
      </Page>
    </Frame>
  );
}
