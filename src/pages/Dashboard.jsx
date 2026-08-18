import React, { useEffect, useState } from "react";
import { Page, Layout, Card, Text, SkeletonBodyText, Banner } from "@shopify/polaris";
import { api } from "../api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/dashboard")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Page title="Dashboard"><Card><SkeletonBodyText lines={5} /></Card></Page>;
  if (error) return <Page title="Dashboard"><Banner tone="critical">{error}</Banner></Page>;

  const stats = [
    { label: "Total Courses", value: data.totalCourses },
    { label: "Total Students", value: data.totalStudents },
    { label: "Total Enrollments", value: data.totalEnrollments },
    { label: "Completed", value: data.completed },
    { label: "In Progress", value: data.inProgress },
  ];

  return (
    <Page title="Dashboard">
      <Layout>
        <Layout.Section>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
            {stats.map((s) => (
              <Card key={s.label}>
                <Text variant="headingLg" as="p">{s.value}</Text>
                <Text tone="subdued" as="p">{s.label}</Text>
              </Card>
            ))}
          </div>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">Recently Enrolled Students</Text>
            {data.recentEnrollments.length === 0 ? (
              <Text tone="subdued" as="p">No enrollments yet.</Text>
            ) : (
              <ul>
                {data.recentEnrollments.map((e) => (
                  <li key={e._id}>{e.student?.name} enrolled in {e.course?.title} — {e.status}</li>
                ))}
              </ul>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
