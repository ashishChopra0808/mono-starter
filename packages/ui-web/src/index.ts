// ─── @mono/ui-web ──────────────────────────────────────────────────────────
// Reusable, theme-aware UI primitives for web applications.
// All components are stateless and presentation-only.
//
// Usage:
//   import { Button, Card, Dialog, toast } from '@mono/ui-web';

// Utilities
export { cn } from './lib/utils';

// Components
export { Button, buttonVariants, type ButtonProps } from './components/button';
export { Input, type InputProps } from './components/input';
export { Label } from './components/label';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './components/card';
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/dialog';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './components/dropdown-menu';
export {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormItem,
} from './components/form';
export { Toaster, toast } from './components/sonner';

// Auth
export { AuthProvider, useAuth } from './components/auth/auth-provider';
export { PermissionGate } from './components/auth/permission-gate';
