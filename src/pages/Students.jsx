import React, { useEffect, useState, useCallback } from "react";
import { Page, Card, IndexTable, EmptyState, Modal, FormLayout, TextField, Toast, Frame, Spinner } from "@shopify/polaris";
import { api } from "../api";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState("");

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
    </IndexTable.Row>
  ));

  return (
    <Frame>
      <Page title="Students" primaryAction={{ content: "Add student", onAction: () => { setForm({ name: "", email: "" }); setErrors({}); setModalOpen(true); } }}>
        <Card>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center" }}><Spinner /></div>
          ) : students.length === 0 ? (
            <EmptyState heading="No students yet" image=""><p>Add your first student to get started.</p></EmptyState>
          ) : (
            <IndexTable resourceName={{ singular: "student", plural: "students" }} itemCount={students.length} headings={[{ title: "Name" }, { title: "Email" }]} selectable={false}>
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

        {toast && <Toast content={toast} onDismiss={() => setToast("")} />}
      </Page>
    </Frame>
  );
}
