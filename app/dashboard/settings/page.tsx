import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import prisma from "@/lib/db";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { SubmitButton } from "@/components/submit-buttons";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

async function getData(userId: string) {
  noStore();
  const data = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, colorScheme: true },
  });
  return data;
}

export default async function Settings() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const data = await getData(user?.id as string);

  async function postData(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const colorScheme = formData.get("color") as string;

    await prisma.user.update({
      where: { id: user?.id },
      data: { name: name ?? undefined, colorScheme: colorScheme ?? undefined },
    });

    revalidatePath("/", "layout");
  }

  return (
    <div className="grid items-start gap-4">
      <div className="flex items-center justify-between px-3">
        <div className="grid gap-1">
          <h1 className="text-2xl">Settings</h1>
          <div className="text-md text-muted-foreground">
            Your Profile Settings
          </div>
        </div>
      </div>

      <Card>
        <form action={postData}>
          <CardHeader>
            <CardTitle>General Data</CardTitle>
            <CardDescription>
              Please provide general information about yourself. Please don't
              forget to save.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label>Your Name</Label>
                <Input
                  name="name"
                  type="text"
                  id="name"
                  defaultValue={data?.name as string}
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-1">
                <Label>Your Email</Label>
                <Input
                  name="email"
                  type="text"
                  id="email"
                  defaultValue={data?.email as string}
                  placeholder="Your Email"
                  disabled
                />
              </div>
              <div className="space-y-1">
                <Label>Color Scheme</Label>
                <Select name="color" defaultValue={data?.colorScheme as string}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Color</SelectLabel>
                      <SelectItem value="theme-slate">Slate</SelectItem>
                      <SelectItem value="theme-zinc">Zinc</SelectItem>
                      <SelectItem value="theme-stone">Stone</SelectItem>
                      <SelectItem value="theme-gray">Gray</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
