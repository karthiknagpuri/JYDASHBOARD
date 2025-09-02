const { supabase } = require('../config/supabase');

class ParticipantService {
  // Get all participants with filters
  async getAll(filters = {}) {
    try {
      let query = supabase
        .from('participants')
        .select(`
          *,
          participant_documents(*),
          participant_notes(*)
        `);

      // Apply filters
      if (filters.year) {
        query = query.eq('year', filters.year);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.participationType) {
        query = query.eq('participation_type', filters.participationType);
      }
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,registration_id.ilike.%${filters.search}%`);
      }

      // Apply pagination
      if (filters.page && filters.limit) {
        const offset = (filters.page - 1) * filters.limit;
        query = query.range(offset, offset + filters.limit - 1);
      }

      // Apply sorting
      if (filters.sortBy) {
        const direction = filters.sortOrder === 'desc' ? false : true;
        query = query.order(filters.sortBy, { ascending: direction });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        participants: data,
        total: count
      };
    } catch (error) {
      console.error('Error fetching participants:', error);
      throw error;
    }
  }

  // Get participant by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select(`
          *,
          participant_documents(*),
          participant_notes(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching participant:', error);
      throw error;
    }
  }

  // Create new participant
  async create(participantData) {
    try {
      // Calculate age from date of birth
      if (participantData.date_of_birth) {
        const birthDate = new Date(participantData.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        participantData.age = age;
      }

      const { data, error } = await supabase
        .from('participants')
        .insert([participantData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating participant:', error);
      throw error;
    }
  }

  // Update participant
  async update(id, updateData) {
    try {
      // Recalculate age if date_of_birth is updated
      if (updateData.date_of_birth) {
        const birthDate = new Date(updateData.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        updateData.age = age;
      }

      const { data, error } = await supabase
        .from('participants')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating participant:', error);
      throw error;
    }
  }

  // Delete participant
  async delete(id) {
    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting participant:', error);
      throw error;
    }
  }

  // Get participant statistics
  async getStats(year) {
    try {
      let query = supabase.from('participants');
      
      if (year) {
        query = query.eq('year', year);
      }

      const { data, error } = await query.select('status, gender, participation_type, payment_status');

      if (error) throw error;

      // Calculate statistics
      const stats = {
        total: data.length,
        byStatus: {},
        byGender: {},
        byParticipationType: {},
        byPaymentStatus: {}
      };

      data.forEach(participant => {
        // Count by status
        stats.byStatus[participant.status] = (stats.byStatus[participant.status] || 0) + 1;
        
        // Count by gender
        stats.byGender[participant.gender] = (stats.byGender[participant.gender] || 0) + 1;
        
        // Count by participation type
        stats.byParticipationType[participant.participation_type] = 
          (stats.byParticipationType[participant.participation_type] || 0) + 1;
        
        // Count by payment status
        stats.byPaymentStatus[participant.payment_status] = 
          (stats.byPaymentStatus[participant.payment_status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching participant stats:', error);
      throw error;
    }
  }

  // Add note to participant
  async addNote(participantId, noteText, addedBy) {
    try {
      const { data, error } = await supabase
        .from('participant_notes')
        .insert([{
          participant_id: participantId,
          note_text: noteText,
          added_by: addedBy
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  // Add document to participant
  async addDocument(participantId, documentData) {
    try {
      const { data, error } = await supabase
        .from('participant_documents')
        .insert([{
          participant_id: participantId,
          ...documentData
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }
}

module.exports = new ParticipantService();