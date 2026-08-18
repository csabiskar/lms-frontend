import React, { useEffect, useState } from "react";
import { Page, Layout, Card, Text, SkeletonBodyText, Banner, InlineGrid, BlockStack, Box, IndexTable, Badge } from "@shopify/polaris";
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
      {data.shopifyData && (
        <div style={{ marginBottom: "1rem" }}>
          <Banner tone="info">
            <Text as="p">Welcome back, <strong>{data.shopifyData.name}</strong>! Your LMS is connected to {data.shopifyData.contactEmail}.</Text>
          </Banner>
        </div>
      )}
      <Layout>
        <Layout.Section>
          <InlineGrid columns={{ xs: 1, sm: 2, md: 3, lg: 5 }} gap="400">
            {stats.map((s) => (
              <Card key={s.label}>
                <BlockStack gap="200">
                  <Text variant="headingXl" as="p">{s.value}</Text>
                  <Text tone="subdued" as="p">{s.label}</Text>
                </BlockStack>
              </Card>
            ))}
          </InlineGrid>
        </Layout.Section>
        <Layout.Section>
          <Card padding="0">
            <Box padding="400" paddingBottom="200">
              <Text variant="headingMd" as="h2">Recently Enrolled Students</Text>
            </Box>
            {data.recentEnrollments.length === 0 ? (
              <Box padding="400">
                <Text tone="subdued" as="p">No enrollments yet.</Text>
              </Box>
            ) : (
              <IndexTable
                resourceName={{ singular: "enrollment", plural: "enrollments" }}
                itemCount={data.recentEnrollments.length}
                headings={[{ title: "Student" }, { title: "Course" }, { title: "Status" }]}
                selectable={false}
              >
                {data.recentEnrollments.map((e, index) => (
                  <IndexTable.Row id={e._id} key={e._id} position={index}>
                    <IndexTable.Cell>{e.student?.name}</IndexTable.Cell>
                    <IndexTable.Cell>{e.course?.title}</IndexTable.Cell>
                    <IndexTable.Cell><Badge tone={e.status === "Completed" ? "success" : "attention"}>{e.status}</Badge></IndexTable.Cell>
                  </IndexTable.Row>
                ))}
              </IndexTable>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
