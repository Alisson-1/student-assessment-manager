import { Eye, GraduationCap, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ClassRoom } from '../types/class';

interface ClassListProps {
  classes: ClassRoom[];
  onEdit: (classRoom: ClassRoom) => void;
  onDelete: (classRoom: ClassRoom) => void;
}

export function ClassList({ classes, onEdit, onDelete }: ClassListProps) {
  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed py-12 text-center">
        <GraduationCap className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No classes registered yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Topic</TableHead>
            <TableHead className="w-[100px]">Year</TableHead>
            <TableHead className="w-[120px]">Semester</TableHead>
            <TableHead className="w-[140px]">Students</TableHead>
            <TableHead className="w-[180px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((classRoom) => (
            <TableRow key={classRoom.id}>
              <TableCell className="font-medium">{classRoom.topic}</TableCell>
              <TableCell>{classRoom.year}</TableCell>
              <TableCell>{classRoom.semester}</TableCell>
              <TableCell>{classRoom.studentIds.length}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    asChild
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`View ${classRoom.topic}`}
                  >
                    <Link to={`/classes/${classRoom.id}`}>
                      <Eye />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(classRoom)}
                    aria-label={`Edit ${classRoom.topic}`}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(classRoom)}
                    aria-label={`Delete ${classRoom.topic}`}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
