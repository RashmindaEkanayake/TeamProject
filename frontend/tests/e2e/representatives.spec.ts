import { test, expect, Page } from "@playwright/test";
const adminPassword =
  process.env.E2E_ADMIN_PASSWORD || process.env.BOOTSTRAP_ADMIN_PASSWORD;
test.beforeEach(() => {
  test.skip(
    !adminPassword,
    "Provide E2E_ADMIN_PASSWORD or generated bootstrap credentials.",
  );
});
async function login(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByPlaceholder("Enter your username").fill(username);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.waitForURL(/dashboard/);
}
test("Admin creates, edits, deactivates and reactivates a representative; sales portal is restricted", async ({
  page,
}) => {
  const suffix = Date.now().toString();
  const username = `e2e.${suffix}`,
    password = `Test-${suffix}-password`;
  await login(page, "admin", adminPassword!);
  await expect(page).toHaveTitle("ATLAS ERP");
  await page.goto("/admin/representatives");
  await page
    .getByRole("button", { name: "Add Representative", exact: true })
    .click();
  const inputs = page.locator("form input");
  const values = [
    "E2E",
    "Representative",
    `${username}@example.com`,
    "0712345678",
    username,
    password,
  ];
  for (let i = 0; i < values.length; i++) await inputs.nth(i).fill(values[i]);
  await page
    .locator("form")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  const row = page.getByRole("row").filter({ hasText: username });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Edit", exact: true }).click();
  await page.locator("form input").first().fill("Edited");
  await page
    .locator("form")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await expect(row).toContainText("Edited");
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await login(page, username, password);
  await page.goto("/admin/representatives");
  await expect(page).toHaveURL(/sales\/dashboard/);
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await login(page, "admin", adminPassword!);
  await page.goto("/admin/representatives");
  await row.getByRole("button", { name: "Deactivate", exact: true }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(
    row.getByRole("cell", { name: "INACTIVE", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await page.getByPlaceholder("Enter your username").fill(username);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page.getByText("Invalid username or password")).toBeVisible();
  await login(page, "admin", adminPassword!);
  await page.goto("/admin/representatives");
  await row.getByRole("button", { name: "Reactivate", exact: true }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(
    row.getByRole("cell", { name: "ACTIVE", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await login(page, username, password);
});
