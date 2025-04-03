import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postStudent, deleteStudent, putStudent, getAllStudents } from '../api/apiStudents';
import { Student } from '../types/student';


export function useAllStudents(searchQuery: Partial<Student> & { page?: number; limit?: number }) {
    const queryClient = useQueryClient();

    const studentsQuery = useQuery({
        queryKey: ['students', JSON.stringify(searchQuery)],
        queryFn: () => getAllStudents(searchQuery),
        placeholderData: (previousData) => previousData
    })

    const createStudent = useMutation({
        mutationFn: (newStudentInfo: Partial<Student>) => postStudent(newStudentInfo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });


    const updateStudent = useMutation({
        mutationFn: ({ studentId, updatedData }: { studentId: string; updatedData: Partial<Student> }) =>
            putStudent(studentId, updatedData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['students', JSON.stringify(searchQuery)]
            });
        },
    });


    const removeStudent = useMutation({
        mutationFn: deleteStudent,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['students', JSON.stringify(searchQuery)]
            });
        },
    });

    return {
        studentsQuery,
        updateStudent,
        createStudent,
        removeStudent,
    };
}

