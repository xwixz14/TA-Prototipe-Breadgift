import { redirect } from "next/navigation";

const SECURE_QUERY = "gs_lcrp=EgZjaHJvbWUqBwgAEAAYjwIyBwgAEAAYjwIyDAgBEC4YJxiABBiKBTIGCAIQRRg7MgYIAxBFGDsyDQgEEAAYgwEYsQMYgAQyDQgFEAAYgwEYsQMYgAQyBggGEEUYPTIGCAcQBRhA0gEHOTA2ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8";

export default function GajiPage() {
  redirect(`/admin/expenses?${SECURE_QUERY}`);
}
