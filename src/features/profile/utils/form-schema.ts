import * as z from 'zod';

export const profileSchema = z.object({
  firstname: z.string().min(3, { message: 'Vui lòng nhập tối thiểu 3 ký tự.' }),
  lastname: z.string().min(3, { message: 'Vui lòng nhập tối thiểu 3 ký tự.' }),
  email: z.string().email({ message: 'Email không hợp lệ.' }),
  contactno: z.coerce.number(),
  country: z.string().min(1, { message: 'Vui lòng chọn mục.' }),
  city: z.string().min(1, { message: 'Vui lòng chọn mục.' }),
  // jobs array is for the dynamic fields
  jobs: z.array(
    z.object({
      jobcountry: z.string().min(1, { message: 'Vui lòng chọn mục.' }),
      jobcity: z.string().min(1, { message: 'Vui lòng chọn mục.' }),
      jobtitle: z
        .string()
        .min(3, { message: 'Vui lòng nhập tối thiểu 3 ký tự.' }),
      employer: z
        .string()
        .min(3, { message: 'Vui lòng nhập tối thiểu 3 ký tự.' }),
      startdate: z
        .string()
        .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), {
          message: 'Ngày bắt đầu phải theo định dạng YYYY-MM-DD.'
        }),
      enddate: z.string().refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), {
        message: 'Ngày kết thúc phải theo định dạng YYYY-MM-DD.'
      })
    })
  )
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
