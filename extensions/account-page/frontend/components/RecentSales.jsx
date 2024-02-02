import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/01.png" alt="Avatar" />
          <AvatarFallback>OM</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-xs font-small leading-none">Olivia Martin</p>
          <p className="text-xs text-muted-foreground">
            olivia.martin@email.com
          </p>
        </div>
        <div className="ml-auto text-xs font-small">+$100.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
          <AvatarImage src="/avatars/02.png" alt="Avatar" />
          <AvatarFallback>JL</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-xs font-small leading-none">Jackson Lee</p>
          <p className="text-xs text-muted-foreground">jackson.lee@email.com</p>
        </div>
        <div className="ml-auto text-xs font-small">+$39.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/03.png" alt="Avatar" />
          <AvatarFallback>IN</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-xs font-small leading-none">Isabella Nguyen</p>
          <p className="text-xs text-muted-foreground">
            isabella.nguyen@email.com
          </p>
        </div>
        <div className="ml-auto text-xs font-small">+$99.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/04.png" alt="Avatar" />
          <AvatarFallback>WK</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-xs font-small leading-none">William Kim</p>
          <p className="text-xs text-muted-foreground">will@email.com</p>
        </div>
        <div className="ml-auto text-xs font-small">+$99.00</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/05.png" alt="Avatar" />
          <AvatarFallback>SD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-xs font-small leading-none">Sofia Davis</p>
          <p className="text-xs  text-muted-foreground">
            sofia.davis@email.com
          </p>
        </div>
        <div className="ml-auto text-xs font-small">+$39.00</div>
      </div>
    </div>
  );
}
