export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      annotated_essays: {
        Row: {
          content_type: string
          created_at: string
          essay_type: string
          estimated_mark_range: string | null
          examiner_summary: string
          full_essay_text: string
          id: string
          question_id: string
          reviewed: boolean
          risks: string[]
          source: string
          strengths: string[]
          student_realism_note: string | null
          target_band: string
          thesis: string
          timed_condition_minutes: number
          title: string
          updated_at: string
          upgrade_targets: string[]
          verification_status: string
          word_count_band: string
        }
        Insert: {
          content_type?: string
          created_at?: string
          essay_type: string
          estimated_mark_range?: string | null
          examiner_summary: string
          full_essay_text: string
          id: string
          question_id: string
          reviewed?: boolean
          risks?: string[]
          source?: string
          strengths?: string[]
          student_realism_note?: string | null
          target_band: string
          thesis: string
          timed_condition_minutes?: number
          title: string
          updated_at?: string
          upgrade_targets?: string[]
          verification_status?: string
          word_count_band: string
        }
        Update: {
          content_type?: string
          created_at?: string
          essay_type?: string
          estimated_mark_range?: string | null
          examiner_summary?: string
          full_essay_text?: string
          id?: string
          question_id?: string
          reviewed?: boolean
          risks?: string[]
          source?: string
          strengths?: string[]
          student_realism_note?: string | null
          target_band?: string
          thesis?: string
          timed_condition_minutes?: number
          title?: string
          updated_at?: string
          upgrade_targets?: string[]
          verification_status?: string
          word_count_band?: string
        }
        Relationships: [
          {
            foreignKeyName: "annotated_essays_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "essay_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      ao_annotations: {
        Row: {
          annotation_order: number
          annotation_type: string
          ao_tags: string[]
          created_at: string
          essay_id: string
          explanation: string
          id: string
          improvement_note: string | null
          paragraph_id: string
          text_span: string
          updated_at: string
          why_it_scores: string
        }
        Insert: {
          annotation_order: number
          annotation_type: string
          ao_tags?: string[]
          created_at?: string
          essay_id: string
          explanation: string
          id: string
          improvement_note?: string | null
          paragraph_id: string
          text_span: string
          updated_at?: string
          why_it_scores: string
        }
        Update: {
          annotation_order?: number
          annotation_type?: string
          ao_tags?: string[]
          created_at?: string
          essay_id?: string
          explanation?: string
          id?: string
          improvement_note?: string | null
          paragraph_id?: string
          text_span?: string
          updated_at?: string
          why_it_scores?: string
        }
        Relationships: [
          {
            foreignKeyName: "ao_annotations_essay_id_fkey"
            columns: ["essay_id"]
            isOneToOne: false
            referencedRelation: "annotated_essays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ao_annotations_paragraph_id_fkey"
            columns: ["paragraph_id"]
            isOneToOne: false
            referencedRelation: "essay_paragraphs"
            referencedColumns: ["id"]
          },
        ]
      }
      ao_readiness: {
        Row: {
          ao: string
          label: string | null
          note: string | null
          score: number
          trend: number
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          ao: string
          label?: string | null
          note?: string | null
          score?: number
          trend?: number
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          ao?: string
          label?: string | null
          note?: string | null
          score?: number
          trend?: number
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      character_cards: {
        Row: {
          common_misreading: string | null
          comparative_link: string | null
          complication: string | null
          core_function: string | null
          created_at: string
          id: string
          level_band: string | null
          linked_methods: string[]
          name: string
          one_line: string
          source_row_key: string | null
          source_text: string
          structural_role: string | null
          themes: string[]
          updated_at: string
          use_case: string | null
        }
        Insert: {
          common_misreading?: string | null
          comparative_link?: string | null
          complication?: string | null
          core_function?: string | null
          created_at?: string
          id: string
          level_band?: string | null
          linked_methods?: string[]
          name: string
          one_line: string
          source_row_key?: string | null
          source_text: string
          structural_role?: string | null
          themes?: string[]
          updated_at?: string
          use_case?: string | null
        }
        Update: {
          common_misreading?: string | null
          comparative_link?: string | null
          complication?: string | null
          core_function?: string | null
          created_at?: string
          id?: string
          level_band?: string | null
          linked_methods?: string[]
          name?: string
          one_line?: string
          source_row_key?: string | null
          source_text?: string
          structural_role?: string | null
          themes?: string[]
          updated_at?: string
          use_case?: string | null
        }
        Relationships: []
      }
      comparative_matrix: {
        Row: {
          ao2: string | null
          ao3: string | null
          ao4: string | null
          atonement: string
          axis: string
          character: string | null
          created_at: string
          divergence: string
          exam_fit: string | null
          hard_times: string
          id: string
          is_active: boolean
          level_band: string | null
          narrative: string | null
          sort_order: number | null
          structure: string | null
          themes: string[]
          thesis: string | null
          updated_at: string
        }
        Insert: {
          ao2?: string | null
          ao3?: string | null
          ao4?: string | null
          atonement: string
          axis: string
          character?: string | null
          created_at?: string
          divergence: string
          exam_fit?: string | null
          hard_times: string
          id: string
          is_active?: boolean
          level_band?: string | null
          narrative?: string | null
          sort_order?: number | null
          structure?: string | null
          themes?: string[]
          thesis?: string | null
          updated_at?: string
        }
        Update: {
          ao2?: string | null
          ao3?: string | null
          ao4?: string | null
          atonement?: string
          axis?: string
          character?: string | null
          created_at?: string
          divergence?: string
          exam_fit?: string | null
          hard_times?: string
          id?: string
          is_active?: boolean
          level_band?: string | null
          narrative?: string | null
          sort_order?: number | null
          structure?: string | null
          themes?: string[]
          thesis?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      essay_marker_results: {
        Row: {
          created_at: string
          essay_text: string | null
          id: string
          mode: string
          model: string | null
          paragraph_attempt_id: string | null
          provisional_level: string | null
          provisional_marks: number | null
          question_id: string | null
          question_stem: string | null
          result_json: Json
          target_grade: string | null
          user_id: string
          word_count: number | null
        }
        Insert: {
          created_at?: string
          essay_text?: string | null
          id?: string
          mode: string
          model?: string | null
          paragraph_attempt_id?: string | null
          provisional_level?: string | null
          provisional_marks?: number | null
          question_id?: string | null
          question_stem?: string | null
          result_json: Json
          target_grade?: string | null
          user_id: string
          word_count?: number | null
        }
        Update: {
          created_at?: string
          essay_text?: string | null
          id?: string
          mode?: string
          model?: string | null
          paragraph_attempt_id?: string | null
          provisional_level?: string | null
          provisional_marks?: number | null
          question_id?: string | null
          question_stem?: string | null
          result_json?: Json
          target_grade?: string | null
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "essay_marker_results_paragraph_attempt_id_fkey"
            columns: ["paragraph_attempt_id"]
            isOneToOne: false
            referencedRelation: "paragraph_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "essay_marker_results_paragraph_attempt_id_fkey"
            columns: ["paragraph_attempt_id"]
            isOneToOne: false
            referencedRelation: "v_student_recent_paragraphs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "essay_marker_results_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      essay_paragraphs: {
        Row: {
          ao_coverage: string[]
          atonement_focus: string | null
          comparative_focus: string
          created_at: string
          essay_id: string
          examiner_comment: string | null
          hard_times_focus: string | null
          id: string
          key_contexts: string[]
          key_methods: string[]
          main_argument: string
          paragraph_function: string
          paragraph_number: number
          paragraph_text: string
          updated_at: string
          upgrade_target: string | null
        }
        Insert: {
          ao_coverage?: string[]
          atonement_focus?: string | null
          comparative_focus: string
          created_at?: string
          essay_id: string
          examiner_comment?: string | null
          hard_times_focus?: string | null
          id: string
          key_contexts?: string[]
          key_methods?: string[]
          main_argument: string
          paragraph_function: string
          paragraph_number: number
          paragraph_text: string
          updated_at?: string
          upgrade_target?: string | null
        }
        Update: {
          ao_coverage?: string[]
          atonement_focus?: string | null
          comparative_focus?: string
          created_at?: string
          essay_id?: string
          examiner_comment?: string | null
          hard_times_focus?: string | null
          id?: string
          key_contexts?: string[]
          key_methods?: string[]
          main_argument?: string
          paragraph_function?: string
          paragraph_number?: number
          paragraph_text?: string
          updated_at?: string
          upgrade_target?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "essay_paragraphs_essay_id_fkey"
            columns: ["essay_id"]
            isOneToOne: false
            referencedRelation: "annotated_essays"
            referencedColumns: ["id"]
          },
        ]
      }
      essay_plans: {
        Row: {
          builder_handoffs: Json
          client_plan_id: string | null
          created_at: string
          family: string | null
          id: string
          interpretive_extension_enabled: boolean
          is_current: boolean
          notes: string | null
          paragraph_cards: Json
          question_id: string | null
          route_id: string | null
          selected_interpretive_extension_ids: Json
          selected_quote_ids: Json
          thesis_id: string | null
          thesis_level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          builder_handoffs?: Json
          client_plan_id?: string | null
          created_at?: string
          family?: string | null
          id?: string
          interpretive_extension_enabled?: boolean
          is_current?: boolean
          notes?: string | null
          paragraph_cards?: Json
          question_id?: string | null
          route_id?: string | null
          selected_interpretive_extension_ids?: Json
          selected_quote_ids?: Json
          thesis_id?: string | null
          thesis_level?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          builder_handoffs?: Json
          client_plan_id?: string | null
          created_at?: string
          family?: string | null
          id?: string
          interpretive_extension_enabled?: boolean
          is_current?: boolean
          notes?: string | null
          paragraph_cards?: Json
          question_id?: string | null
          route_id?: string | null
          selected_interpretive_extension_ids?: Json
          selected_quote_ids?: Json
          thesis_id?: string | null
          thesis_level?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      essay_questions: {
        Row: {
          ao_requirements: string[]
          component: string
          content_type: string
          created_at: string
          difficulty_level: string
          exam_board: string
          id: string
          level_5_upgrade_moves: string[]
          likely_routes: string[]
          linked_paragraph_stem_ids: string[]
          linked_quote_cluster_ids: string[]
          marks: number
          paper_code: string
          pitfalls: string[]
          post_1900_text: string
          pre_1900_text: string
          question_family: string
          question_text: string
          reviewed: boolean
          source: string
          text_pair: string
          theme: string
          updated_at: string
          verification_status: string
          year: string | null
        }
        Insert: {
          ao_requirements?: string[]
          component?: string
          content_type?: string
          created_at?: string
          difficulty_level: string
          exam_board?: string
          id: string
          level_5_upgrade_moves?: string[]
          likely_routes?: string[]
          linked_paragraph_stem_ids?: string[]
          linked_quote_cluster_ids?: string[]
          marks?: number
          paper_code?: string
          pitfalls?: string[]
          post_1900_text?: string
          pre_1900_text?: string
          question_family: string
          question_text: string
          reviewed?: boolean
          source?: string
          text_pair?: string
          theme: string
          updated_at?: string
          verification_status?: string
          year?: string | null
        }
        Update: {
          ao_requirements?: string[]
          component?: string
          content_type?: string
          created_at?: string
          difficulty_level?: string
          exam_board?: string
          id?: string
          level_5_upgrade_moves?: string[]
          likely_routes?: string[]
          linked_paragraph_stem_ids?: string[]
          linked_quote_cluster_ids?: string[]
          marks?: number
          paper_code?: string
          pitfalls?: string[]
          post_1900_text?: string
          pre_1900_text?: string
          question_family?: string
          question_text?: string
          reviewed?: boolean
          source?: string
          text_pair?: string
          theme?: string
          updated_at?: string
          verification_status?: string
          year?: string | null
        }
        Relationships: []
      }
      glossary_terms: {
        Row: {
          best_verbs: string[]
          category: string | null
          common_misuse_warning: string | null
          created_at: string
          definition: string
          example_at: string | null
          example_ht: string | null
          id: string
          is_active: boolean
          level_tag: string | null
          sentence_stem: string | null
          sort_order: number | null
          source_text: string | null
          student_friendly_definition: string | null
          term: string
          theme_links: string[]
          updated_at: string
          what_to_notice: string | null
        }
        Insert: {
          best_verbs?: string[]
          category?: string | null
          common_misuse_warning?: string | null
          created_at?: string
          definition?: string
          example_at?: string | null
          example_ht?: string | null
          id: string
          is_active?: boolean
          level_tag?: string | null
          sentence_stem?: string | null
          sort_order?: number | null
          source_text?: string | null
          student_friendly_definition?: string | null
          term: string
          theme_links?: string[]
          updated_at?: string
          what_to_notice?: string | null
        }
        Update: {
          best_verbs?: string[]
          category?: string | null
          common_misuse_warning?: string | null
          created_at?: string
          definition?: string
          example_at?: string | null
          example_ht?: string | null
          id?: string
          is_active?: boolean
          level_tag?: string | null
          sentence_stem?: string | null
          sort_order?: number | null
          source_text?: string | null
          student_friendly_definition?: string | null
          term?: string
          theme_links?: string[]
          updated_at?: string
          what_to_notice?: string | null
        }
        Relationships: []
      }
      import_logs: {
        Row: {
          created_at: string
          dataset: string
          error_count: number
          errors: Json | null
          filename: string | null
          id: string
          imported_by: string | null
          inserted_count: number
          skipped_count: number
          updated_count: number
        }
        Insert: {
          created_at?: string
          dataset: string
          error_count?: number
          errors?: Json | null
          filename?: string | null
          id?: string
          imported_by?: string | null
          inserted_count?: number
          skipped_count?: number
          updated_count?: number
        }
        Update: {
          created_at?: string
          dataset?: string
          error_count?: number
          errors?: Json | null
          filename?: string | null
          id?: string
          imported_by?: string | null
          inserted_count?: number
          skipped_count?: number
          updated_count?: number
        }
        Relationships: []
      }
      interpretive_tensions: {
        Row: {
          alternative_reading: string
          best_use: string[]
          created_at: string
          dominant_reading: string
          focus: string
          id: string
          interpretive_stem: string
          level_tag: string
          updated_at: string
        }
        Insert: {
          alternative_reading: string
          best_use?: string[]
          created_at?: string
          dominant_reading: string
          focus: string
          id: string
          interpretive_stem: string
          level_tag: string
          updated_at?: string
        }
        Update: {
          alternative_reading?: string
          best_use?: string[]
          created_at?: string
          dominant_reading?: string
          focus?: string
          id?: string
          interpretive_stem?: string
          level_tag?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          last_viewed_at: string
          lesson_id: string
          progress_pct: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_viewed_at?: string
          lesson_id: string
          progress_pct?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_viewed_at?: string
          lesson_id?: string
          progress_pct?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          body: string | null
          created_at: string
          estimated_minutes: number | null
          id: string
          module_id: string
          position: number
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          module_id: string
          position?: number
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          module_id?: string
          position?: number
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      library_context_bank: {
        Row: {
          ao_tags: string[]
          content_hash: string | null
          context_point: string
          context_title: string | null
          context_type: string | null
          created_at: string
          created_by: string | null
          exam_use: string | null
          id: string
          import_log_id: string | null
          linked_quote_refs: string[]
          metadata: Json
          notes: string | null
          source_dataset: string | null
          source_row_number: number | null
          source_sheet: string | null
          source_text: string | null
          theme_tags: string[]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ao_tags?: string[]
          content_hash?: string | null
          context_point: string
          context_title?: string | null
          context_type?: string | null
          created_at?: string
          created_by?: string | null
          exam_use?: string | null
          id?: string
          import_log_id?: string | null
          linked_quote_refs?: string[]
          metadata?: Json
          notes?: string | null
          source_dataset?: string | null
          source_row_number?: number | null
          source_sheet?: string | null
          source_text?: string | null
          theme_tags?: string[]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ao_tags?: string[]
          content_hash?: string | null
          context_point?: string
          context_title?: string | null
          context_type?: string | null
          created_at?: string
          created_by?: string | null
          exam_use?: string | null
          id?: string
          import_log_id?: string | null
          linked_quote_refs?: string[]
          metadata?: Json
          notes?: string | null
          source_dataset?: string | null
          source_row_number?: number | null
          source_sheet?: string | null
          source_text?: string | null
          theme_tags?: string[]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_context_bank_import_log_id_fkey"
            columns: ["import_log_id"]
            isOneToOne: false
            referencedRelation: "import_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      library_paragraph_frames: {
        Row: {
          ao_tags: string[]
          ao2_stem: string | null
          ao3_stem: string | null
          ao4_stem: string | null
          comparison_stem: string | null
          content_hash: string | null
          created_at: string
          created_by: string | null
          frame_text: string
          frame_title: string | null
          grade_band: string | null
          id: string
          import_log_id: string | null
          interpretive_stem: string | null
          metadata: Json
          notes: string | null
          opening_stem: string | null
          source_dataset: string | null
          source_row_number: number | null
          source_sheet: string | null
          source_text: string | null
          theme_tags: string[]
          updated_at: string
          updated_by: string | null
          use_case: string | null
        }
        Insert: {
          ao_tags?: string[]
          ao2_stem?: string | null
          ao3_stem?: string | null
          ao4_stem?: string | null
          comparison_stem?: string | null
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          frame_text: string
          frame_title?: string | null
          grade_band?: string | null
          id?: string
          import_log_id?: string | null
          interpretive_stem?: string | null
          metadata?: Json
          notes?: string | null
          opening_stem?: string | null
          source_dataset?: string | null
          source_row_number?: number | null
          source_sheet?: string | null
          source_text?: string | null
          theme_tags?: string[]
          updated_at?: string
          updated_by?: string | null
          use_case?: string | null
        }
        Update: {
          ao_tags?: string[]
          ao2_stem?: string | null
          ao3_stem?: string | null
          ao4_stem?: string | null
          comparison_stem?: string | null
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          frame_text?: string
          frame_title?: string | null
          grade_band?: string | null
          id?: string
          import_log_id?: string | null
          interpretive_stem?: string | null
          metadata?: Json
          notes?: string | null
          opening_stem?: string | null
          source_dataset?: string | null
          source_row_number?: number | null
          source_sheet?: string | null
          source_text?: string | null
          theme_tags?: string[]
          updated_at?: string
          updated_by?: string | null
          use_case?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_paragraph_frames_import_log_id_fkey"
            columns: ["import_log_id"]
            isOneToOne: false
            referencedRelation: "import_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      library_thesis_bank: {
        Row: {
          ao_tags: string[]
          argument_type: string | null
          content_hash: string | null
          created_at: string
          created_by: string | null
          grade_band: string | null
          id: string
          import_log_id: string | null
          metadata: Json
          notes: string | null
          paired_text: string | null
          question_focus: string | null
          route_id: string | null
          source_dataset: string | null
          source_row_number: number | null
          source_sheet: string | null
          source_text: string | null
          theme_tags: string[]
          thesis_text: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ao_tags?: string[]
          argument_type?: string | null
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          grade_band?: string | null
          id?: string
          import_log_id?: string | null
          metadata?: Json
          notes?: string | null
          paired_text?: string | null
          question_focus?: string | null
          route_id?: string | null
          source_dataset?: string | null
          source_row_number?: number | null
          source_sheet?: string | null
          source_text?: string | null
          theme_tags?: string[]
          thesis_text: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ao_tags?: string[]
          argument_type?: string | null
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          grade_band?: string | null
          id?: string
          import_log_id?: string | null
          metadata?: Json
          notes?: string | null
          paired_text?: string | null
          question_focus?: string | null
          route_id?: string | null
          source_dataset?: string | null
          source_row_number?: number | null
          source_sheet?: string | null
          source_text?: string | null
          theme_tags?: string[]
          thesis_text?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_thesis_bank_import_log_id_fkey"
            columns: ["import_log_id"]
            isOneToOne: false
            referencedRelation: "import_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_thesis_bank_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      misconception_upgrades: {
        Row: {
          content_type: string
          created_at: string
          diagnosis: string
          example_problem_sentence: string
          id: string
          improved_level_5_version: string
          linked_drill_id: string | null
          reviewed: boolean
          source: string
          updated_at: string
          verification_status: string
          weakness: string
        }
        Insert: {
          content_type?: string
          created_at?: string
          diagnosis: string
          example_problem_sentence: string
          id: string
          improved_level_5_version: string
          linked_drill_id?: string | null
          reviewed?: boolean
          source?: string
          updated_at?: string
          verification_status?: string
          weakness: string
        }
        Update: {
          content_type?: string
          created_at?: string
          diagnosis?: string
          example_problem_sentence?: string
          id?: string
          improved_level_5_version?: string
          linked_drill_id?: string | null
          reviewed?: boolean
          source?: string
          updated_at?: string
          verification_status?: string
          weakness?: string
        }
        Relationships: [
          {
            foreignKeyName: "misconception_upgrades_linked_drill_id_fkey"
            columns: ["linked_drill_id"]
            isOneToOne: false
            referencedRelation: "paragraph_stems"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          id: string
          position: number
          published: boolean
          slug: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          published?: boolean
          slug: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          published?: boolean
          slug?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      paragraph_attempt_quote_links: {
        Row: {
          created_at: string
          id: string
          paragraph_attempt_id: string
          quote_pair_id: string
          role: string
        }
        Insert: {
          created_at?: string
          id?: string
          paragraph_attempt_id: string
          quote_pair_id: string
          role?: string
        }
        Update: {
          created_at?: string
          id?: string
          paragraph_attempt_id?: string
          quote_pair_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "paragraph_attempt_quote_links_paragraph_attempt_id_fkey"
            columns: ["paragraph_attempt_id"]
            isOneToOne: false
            referencedRelation: "paragraph_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paragraph_attempt_quote_links_paragraph_attempt_id_fkey"
            columns: ["paragraph_attempt_id"]
            isOneToOne: false
            referencedRelation: "v_student_recent_paragraphs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paragraph_attempt_quote_links_quote_pair_id_fkey"
            columns: ["quote_pair_id"]
            isOneToOne: false
            referencedRelation: "quote_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      paragraph_attempts: {
        Row: {
          ao1_self_score: number | null
          ao1_sophistication_self_score: number | null
          ao2_self_score: number | null
          ao3_context_integration: string | null
          ao3_self_score: number | null
          ao4_comparison: string | null
          ao4_self_score: number | null
          atonement_analysis: string | null
          created_at: string
          draft_status: string
          exam_question_id: string | null
          feedback_summary: string | null
          final_paragraph: string | null
          hard_times_analysis: string | null
          id: string
          improvement_target: string | null
          interpretive_judgement: string | null
          paragraph_function: string | null
          paragraph_position: number | null
          paragraph_template_id: string | null
          quote_pair_id: string | null
          student_id: string
          thesis_route_id: string | null
          topic_sentence: string | null
          updated_at: string
        }
        Insert: {
          ao1_self_score?: number | null
          ao1_sophistication_self_score?: number | null
          ao2_self_score?: number | null
          ao3_context_integration?: string | null
          ao3_self_score?: number | null
          ao4_comparison?: string | null
          ao4_self_score?: number | null
          atonement_analysis?: string | null
          created_at?: string
          draft_status?: string
          exam_question_id?: string | null
          feedback_summary?: string | null
          final_paragraph?: string | null
          hard_times_analysis?: string | null
          id?: string
          improvement_target?: string | null
          interpretive_judgement?: string | null
          paragraph_function?: string | null
          paragraph_position?: number | null
          paragraph_template_id?: string | null
          quote_pair_id?: string | null
          student_id: string
          thesis_route_id?: string | null
          topic_sentence?: string | null
          updated_at?: string
        }
        Update: {
          ao1_self_score?: number | null
          ao1_sophistication_self_score?: number | null
          ao2_self_score?: number | null
          ao3_context_integration?: string | null
          ao3_self_score?: number | null
          ao4_comparison?: string | null
          ao4_self_score?: number | null
          atonement_analysis?: string | null
          created_at?: string
          draft_status?: string
          exam_question_id?: string | null
          feedback_summary?: string | null
          final_paragraph?: string | null
          hard_times_analysis?: string | null
          id?: string
          improvement_target?: string | null
          interpretive_judgement?: string | null
          paragraph_function?: string | null
          paragraph_position?: number | null
          paragraph_template_id?: string | null
          quote_pair_id?: string | null
          student_id?: string
          thesis_route_id?: string | null
          topic_sentence?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "paragraph_attempts_exam_question_id_fkey"
            columns: ["exam_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paragraph_attempts_paragraph_template_id_fkey"
            columns: ["paragraph_template_id"]
            isOneToOne: false
            referencedRelation: "paragraph_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paragraph_attempts_quote_pair_id_fkey"
            columns: ["quote_pair_id"]
            isOneToOne: false
            referencedRelation: "quote_pairs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paragraph_attempts_thesis_route_id_fkey"
            columns: ["thesis_route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      paragraph_jobs: {
        Row: {
          created_at: string
          divergence_prompt: string
          id: string
          job_title: string
          judgement_prompt: string
          level_band: string | null
          question_family: string
          recommended_methods: string[]
          recommended_themes: string[]
          route_id: string
          suggested_evidence_type: string | null
          text1_prompt: string
          text2_prompt: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          divergence_prompt: string
          id: string
          job_title: string
          judgement_prompt: string
          level_band?: string | null
          question_family: string
          recommended_methods?: string[]
          recommended_themes?: string[]
          route_id: string
          suggested_evidence_type?: string | null
          text1_prompt: string
          text2_prompt: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          divergence_prompt?: string
          id?: string
          job_title?: string
          judgement_prompt?: string
          level_band?: string | null
          question_family?: string
          recommended_methods?: string[]
          recommended_themes?: string[]
          route_id?: string
          suggested_evidence_type?: string | null
          text1_prompt?: string
          text2_prompt?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "paragraph_jobs_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      paragraph_stems: {
        Row: {
          ao: string[]
          best_themes: string[]
          comparison_route: string | null
          compatible_characters: string[]
          compatible_quotes: string[]
          content_type: string
          context_route: string | null
          created_at: string
          curation_status: string | null
          drill_instruction: string | null
          example_use: string | null
          function: string
          id: string
          is_active: boolean
          level_band: string
          method_triggers: string[]
          question_family: string | null
          reviewed: boolean
          sort_order: number
          source: string
          source_text: string | null
          stem_text: string
          text_focus: string | null
          theme: string | null
          timed_target_minutes: number | null
          updated_at: string
          verification_status: string
        }
        Insert: {
          ao?: string[]
          best_themes?: string[]
          comparison_route?: string | null
          compatible_characters?: string[]
          compatible_quotes?: string[]
          content_type?: string
          context_route?: string | null
          created_at?: string
          curation_status?: string | null
          drill_instruction?: string | null
          example_use?: string | null
          function?: string
          id: string
          is_active?: boolean
          level_band?: string
          method_triggers?: string[]
          question_family?: string | null
          reviewed?: boolean
          sort_order?: number
          source?: string
          source_text?: string | null
          stem_text: string
          text_focus?: string | null
          theme?: string | null
          timed_target_minutes?: number | null
          updated_at?: string
          verification_status?: string
        }
        Update: {
          ao?: string[]
          best_themes?: string[]
          comparison_route?: string | null
          compatible_characters?: string[]
          compatible_quotes?: string[]
          content_type?: string
          context_route?: string | null
          created_at?: string
          curation_status?: string | null
          drill_instruction?: string | null
          example_use?: string | null
          function?: string
          id?: string
          is_active?: boolean
          level_band?: string
          method_triggers?: string[]
          question_family?: string | null
          reviewed?: boolean
          sort_order?: number
          source?: string
          source_text?: string | null
          stem_text?: string
          text_focus?: string | null
          theme?: string | null
          timed_target_minutes?: number | null
          updated_at?: string
          verification_status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          exam_date: string | null
          id: string
          onboarding_complete: boolean
          school_year: string | null
          target_grade: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          exam_date?: string | null
          id?: string
          onboarding_complete?: boolean
          school_year?: string | null
          target_grade?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          exam_date?: string | null
          id?: string
          onboarding_complete?: boolean
          school_year?: string | null
          target_grade?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          ao_emphasis: string | null
          authenticity_status: string | null
          created_at: string
          family: string
          id: string
          is_active: boolean
          level_tag: string
          likely_core_methods: string[]
          metadata: Json | null
          paper_code: string | null
          primary_route_id: string
          secondary_route_id: string
          source_type: string | null
          stem: string
          text_pairing: string | null
          updated_at: string
          year_source: string | null
        }
        Insert: {
          ao_emphasis?: string | null
          authenticity_status?: string | null
          created_at?: string
          family: string
          id: string
          is_active?: boolean
          level_tag: string
          likely_core_methods?: string[]
          metadata?: Json | null
          paper_code?: string | null
          primary_route_id: string
          secondary_route_id: string
          source_type?: string | null
          stem: string
          text_pairing?: string | null
          updated_at?: string
          year_source?: string | null
        }
        Update: {
          ao_emphasis?: string | null
          authenticity_status?: string | null
          created_at?: string
          family?: string
          id?: string
          is_active?: boolean
          level_tag?: string
          likely_core_methods?: string[]
          metadata?: Json | null
          paper_code?: string | null
          primary_route_id?: string
          secondary_route_id?: string
          source_type?: string | null
          stem?: string
          text_pairing?: string | null
          updated_at?: string
          year_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_primary_route_id_fkey"
            columns: ["primary_route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_secondary_route_id_fkey"
            columns: ["secondary_route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_method_links: {
        Row: {
          ao2_explanation: string
          ao4_comparative_partner: string | null
          character: string | null
          content_type: string
          created_at: string
          essay_question_id: string | null
          id: string
          method: string
          paragraph_stem_id: string | null
          quotation: string
          quote_type: string
          reviewed: boolean
          source: string
          speaker_or_narrative_location: string | null
          text: string
          theme: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          ao2_explanation: string
          ao4_comparative_partner?: string | null
          character?: string | null
          content_type?: string
          created_at?: string
          essay_question_id?: string | null
          id: string
          method: string
          paragraph_stem_id?: string | null
          quotation: string
          quote_type?: string
          reviewed?: boolean
          source?: string
          speaker_or_narrative_location?: string | null
          text: string
          theme: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          ao2_explanation?: string
          ao4_comparative_partner?: string | null
          character?: string | null
          content_type?: string
          created_at?: string
          essay_question_id?: string | null
          id?: string
          method?: string
          paragraph_stem_id?: string | null
          quotation?: string
          quote_type?: string
          reviewed?: boolean
          source?: string
          speaker_or_narrative_location?: string | null
          text?: string
          theme?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_method_links_essay_question_id_fkey"
            columns: ["essay_question_id"]
            isOneToOne: false
            referencedRelation: "essay_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_method_links_paragraph_stem_id_fkey"
            columns: ["paragraph_stem_id"]
            isOneToOne: false
            referencedRelation: "paragraph_stems"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_methods: {
        Row: {
          ao_priority: string[] | null
          b_mode_rank: number | null
          best_themes: string[]
          best_used_for: string[] | null
          comparative_prompts: string[] | null
          comparison_strength: string | null
          created_at: string
          curation_status: string | null
          effect_prompt: string
          exam_question_tags: string[] | null
          grade_priority: string | null
          id: string
          is_active: boolean
          is_core_quote: boolean | null
          level_tag: string
          linked_context: string[] | null
          linked_interpretations: string[] | null
          linked_motifs: string[] | null
          location_reference: string | null
          meaning_prompt: string
          method: string
          opening_stems: string[] | null
          plain_english_meaning: string | null
          question_types: string[] | null
          quote_text: string
          recommended_for_questions: string[] | null
          retrieval_priority: number | null
          sort_order: number | null
          source_row_key: string | null
          source_text: string
          speaker_or_narrator: string | null
          updated_at: string
        }
        Insert: {
          ao_priority?: string[] | null
          b_mode_rank?: number | null
          best_themes?: string[]
          best_used_for?: string[] | null
          comparative_prompts?: string[] | null
          comparison_strength?: string | null
          created_at?: string
          curation_status?: string | null
          effect_prompt: string
          exam_question_tags?: string[] | null
          grade_priority?: string | null
          id: string
          is_active?: boolean
          is_core_quote?: boolean | null
          level_tag: string
          linked_context?: string[] | null
          linked_interpretations?: string[] | null
          linked_motifs?: string[] | null
          location_reference?: string | null
          meaning_prompt: string
          method: string
          opening_stems?: string[] | null
          plain_english_meaning?: string | null
          question_types?: string[] | null
          quote_text: string
          recommended_for_questions?: string[] | null
          retrieval_priority?: number | null
          sort_order?: number | null
          source_row_key?: string | null
          source_text: string
          speaker_or_narrator?: string | null
          updated_at?: string
        }
        Update: {
          ao_priority?: string[] | null
          b_mode_rank?: number | null
          best_themes?: string[]
          best_used_for?: string[] | null
          comparative_prompts?: string[] | null
          comparison_strength?: string | null
          created_at?: string
          curation_status?: string | null
          effect_prompt?: string
          exam_question_tags?: string[] | null
          grade_priority?: string | null
          id?: string
          is_active?: boolean
          is_core_quote?: boolean | null
          level_tag?: string
          linked_context?: string[] | null
          linked_interpretations?: string[] | null
          linked_motifs?: string[] | null
          location_reference?: string | null
          meaning_prompt?: string
          method?: string
          opening_stems?: string[] | null
          plain_english_meaning?: string | null
          question_types?: string[] | null
          quote_text?: string
          recommended_for_questions?: string[] | null
          retrieval_priority?: number | null
          sort_order?: number | null
          source_row_key?: string | null
          source_text?: string
          speaker_or_narrator?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quote_pairs: {
        Row: {
          ao3_context_trigger_sentence: string | null
          ao3_historical_context: string | null
          ao3_literary_context: string | null
          ao4_comparison_type: string | null
          atonement_location: string | null
          atonement_method: string | null
          atonement_quote: string
          created_at: string
          effect_on_meaning: string | null
          hard_times_location: string | null
          hard_times_method: string | null
          hard_times_quote: string
          how_they_compare: string | null
          id: string
          interpretive_tension: string | null
          key_word_image_focus: string | null
          method_category: string | null
          quote_pair_code: string
          structural_function: string | null
          student_action: string | null
          theme_label: string
          updated_at: string
          why_useful_in_essay: string | null
        }
        Insert: {
          ao3_context_trigger_sentence?: string | null
          ao3_historical_context?: string | null
          ao3_literary_context?: string | null
          ao4_comparison_type?: string | null
          atonement_location?: string | null
          atonement_method?: string | null
          atonement_quote?: string
          created_at?: string
          effect_on_meaning?: string | null
          hard_times_location?: string | null
          hard_times_method?: string | null
          hard_times_quote?: string
          how_they_compare?: string | null
          id?: string
          interpretive_tension?: string | null
          key_word_image_focus?: string | null
          method_category?: string | null
          quote_pair_code: string
          structural_function?: string | null
          student_action?: string | null
          theme_label: string
          updated_at?: string
          why_useful_in_essay?: string | null
        }
        Update: {
          ao3_context_trigger_sentence?: string | null
          ao3_historical_context?: string | null
          ao3_literary_context?: string | null
          ao4_comparison_type?: string | null
          atonement_location?: string | null
          atonement_method?: string | null
          atonement_quote?: string
          created_at?: string
          effect_on_meaning?: string | null
          hard_times_location?: string | null
          hard_times_method?: string | null
          hard_times_quote?: string
          how_they_compare?: string | null
          id?: string
          interpretive_tension?: string | null
          key_word_image_focus?: string | null
          method_category?: string | null
          quote_pair_code?: string
          structural_function?: string | null
          student_action?: string | null
          theme_label?: string
          updated_at?: string
          why_useful_in_essay?: string | null
        }
        Relationships: []
      }
      quote_question_links: {
        Row: {
          created_at: string
          id: string
          question_id: string
          quote_id: string
          rationale: string | null
          relevance_score: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          quote_id: string
          rationale?: string | null
          relevance_score?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          quote_id?: string
          rationale?: string | null
          relevance_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_question_links_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_question_links_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quote_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          a_star_insight: string | null
          anchor_id: string | null
          ao_tags: string[]
          attribution: string
          created_at: string
          id: string
          is_verified: boolean
          location: string | null
          paired_anchor_id: string | null
          source: string
          text: string
          theme_tags: string[]
          word_analysis: string | null
        }
        Insert: {
          a_star_insight?: string | null
          anchor_id?: string | null
          ao_tags?: string[]
          attribution: string
          created_at?: string
          id?: string
          is_verified?: boolean
          location?: string | null
          paired_anchor_id?: string | null
          source: string
          text: string
          theme_tags?: string[]
          word_analysis?: string | null
        }
        Update: {
          a_star_insight?: string | null
          anchor_id?: string | null
          ao_tags?: string[]
          attribution?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          location?: string | null
          paired_anchor_id?: string | null
          source?: string
          text?: string
          theme_tags?: string[]
          word_analysis?: string | null
        }
        Relationships: []
      }
      reflection_entries: {
        Row: {
          checklist: Json
          created_at: string
          device_id: string | null
          first_failure_point: string | null
          id: string
          session_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          checklist?: Json
          created_at?: string
          device_id?: string | null
          first_failure_point?: string | null
          id?: string
          session_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          checklist?: Json
          created_at?: string
          device_id?: string | null
          first_failure_point?: string | null
          id?: string
          session_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reflection_entries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "timed_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lesson_id: string | null
          module_id: string | null
          position: number
          published: boolean
          resource_type: string
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lesson_id?: string | null
          module_id?: string | null
          position?: number
          published?: boolean
          resource_type?: string
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lesson_id?: string | null
          module_id?: string | null
          position?: number
          published?: boolean
          resource_type?: string
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      retrieval_items: {
        Row: {
          correct_reviews: number
          created_at: string
          ease_factor: number
          id: string
          interval_days: number
          item_id: string
          item_type: string
          last_reviewed_at: string | null
          next_review_at: string
          repetitions: number
          total_reviews: number
          updated_at: string
          user_id: string
        }
        Insert: {
          correct_reviews?: number
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          item_id: string
          item_type: string
          last_reviewed_at?: string | null
          next_review_at?: string
          repetitions?: number
          total_reviews?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          correct_reviews?: number
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          item_id?: string
          item_type?: string
          last_reviewed_at?: string | null
          next_review_at?: string
          repetitions?: number
          total_reviews?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      retrieval_responses: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          new_ease_factor: number | null
          new_interval_days: number | null
          new_repetitions: number | null
          quality: number
          recalled_correctly: boolean
          response_time_ms: number | null
          retrieval_item_id: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          new_ease_factor?: number | null
          new_interval_days?: number | null
          new_repetitions?: number | null
          quality: number
          recalled_correctly: boolean
          response_time_ms?: number | null
          retrieval_item_id?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          new_ease_factor?: number | null
          new_interval_days?: number | null
          new_repetitions?: number | null
          quality?: number
          recalled_correctly?: boolean
          response_time_ms?: number | null
          retrieval_item_id?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retrieval_responses_retrieval_item_id_fkey"
            columns: ["retrieval_item_id"]
            isOneToOne: false
            referencedRelation: "retrieval_due_today"
            referencedColumns: ["retrieval_item_id"]
          },
          {
            foreignKeyName: "retrieval_responses_retrieval_item_id_fkey"
            columns: ["retrieval_item_id"]
            isOneToOne: false
            referencedRelation: "retrieval_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrieval_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "retrieval_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      retrieval_sessions: {
        Row: {
          completed: boolean
          correct_items: number
          created_at: string
          device_id: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          session_type: string
          started_at: string
          total_items: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean
          correct_items?: number
          created_at?: string
          device_id?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          session_type?: string
          started_at?: string
          total_items?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean
          correct_items?: number
          created_at?: string
          device_id?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          session_type?: string
          started_at?: string
          total_items?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      routes: {
        Row: {
          atonement_emphasis: string
          best_use: string
          comparative_insight: string
          core_question: string
          created_at: string
          hard_times_emphasis: string
          id: string
          level_tag: string
          name: string
          updated_at: string
        }
        Insert: {
          atonement_emphasis: string
          best_use: string
          comparative_insight: string
          core_question: string
          created_at?: string
          hard_times_emphasis: string
          id: string
          level_tag: string
          name: string
          updated_at?: string
        }
        Update: {
          atonement_emphasis?: string
          best_use?: string
          comparative_insight?: string
          core_question?: string
          created_at?: string
          hard_times_emphasis?: string
          id?: string
          level_tag?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_essay_plans: {
        Row: {
          created_at: string
          device_id: string | null
          family: string | null
          id: string
          interpretive_extension_enabled: boolean
          paragraph_cards: Json
          paragraph_job_ids: string[]
          question_id: string | null
          route_id: string | null
          selected_interpretive_extension_ids: string[]
          selected_quote_ids: string[]
          thesis_id: string | null
          thesis_level: string | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          family?: string | null
          id?: string
          interpretive_extension_enabled?: boolean
          paragraph_cards?: Json
          paragraph_job_ids?: string[]
          question_id?: string | null
          route_id?: string | null
          selected_interpretive_extension_ids?: string[]
          selected_quote_ids?: string[]
          thesis_id?: string | null
          thesis_level?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string | null
          family?: string | null
          id?: string
          interpretive_extension_enabled?: boolean
          paragraph_cards?: Json
          paragraph_job_ids?: string[]
          question_id?: string | null
          route_id?: string | null
          selected_interpretive_extension_ids?: string[]
          selected_quote_ids?: string[]
          thesis_id?: string | null
          thesis_level?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      saved_views: {
        Row: {
          created_at: string
          dataset: string
          from: string
          id: string
          is_default: boolean
          name: string
          q: string
          to: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dataset?: string
          from?: string
          id?: string
          is_default?: boolean
          name: string
          q?: string
          to?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dataset?: string
          from?: string
          id?: string
          is_default?: boolean
          name?: string
          q?: string
          to?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      staged_changes: {
        Row: {
          applied_at: string | null
          apply_error: string | null
          changed_fields: string[]
          content_hash: string | null
          created_at: string
          dedupe_key: string | null
          id: string
          import_log_id: string | null
          normalized_payload: Json
          note: string | null
          operation: string
          original_snapshot: Json
          proposal_type: string
          proposed_at: string
          proposed_by: string | null
          proposed_patch: Json
          reviewed_at: string | null
          reviewed_by: string | null
          source_finding_id: string | null
          source_issue_type: string | null
          source_payload: Json
          source_row_number: number | null
          source_surface: string | null
          status: string
          target_record_id: string
          target_table: string
          updated_at: string
          validation_errors: Json
          validation_status: string
        }
        Insert: {
          applied_at?: string | null
          apply_error?: string | null
          changed_fields?: string[]
          content_hash?: string | null
          created_at?: string
          dedupe_key?: string | null
          id?: string
          import_log_id?: string | null
          normalized_payload?: Json
          note?: string | null
          operation?: string
          original_snapshot?: Json
          proposal_type?: string
          proposed_at?: string
          proposed_by?: string | null
          proposed_patch?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_finding_id?: string | null
          source_issue_type?: string | null
          source_payload?: Json
          source_row_number?: number | null
          source_surface?: string | null
          status?: string
          target_record_id: string
          target_table: string
          updated_at?: string
          validation_errors?: Json
          validation_status?: string
        }
        Update: {
          applied_at?: string | null
          apply_error?: string | null
          changed_fields?: string[]
          content_hash?: string | null
          created_at?: string
          dedupe_key?: string | null
          id?: string
          import_log_id?: string | null
          normalized_payload?: Json
          note?: string | null
          operation?: string
          original_snapshot?: Json
          proposal_type?: string
          proposed_at?: string
          proposed_by?: string | null
          proposed_patch?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_finding_id?: string | null
          source_issue_type?: string | null
          source_payload?: Json
          source_row_number?: number | null
          source_surface?: string | null
          status?: string
          target_record_id?: string
          target_table?: string
          updated_at?: string
          validation_errors?: Json
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "staged_changes_import_log_id_fkey"
            columns: ["import_log_id"]
            isOneToOne: false
            referencedRelation: "import_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      student_quote_pair_mastery: {
        Row: {
          ao2_secure: boolean
          ao3_secure: boolean
          ao4_secure: boolean
          confidence_score: number | null
          created_at: string
          id: string
          interpretive_secure: boolean
          last_practised_at: string | null
          mastery_status: string
          needs_review: boolean
          next_action: string | null
          quote_pair_id: string
          student_id: string
          updated_at: string
          used_in_essay_count: number
          used_in_paragraph_count: number
          used_in_plan_count: number
        }
        Insert: {
          ao2_secure?: boolean
          ao3_secure?: boolean
          ao4_secure?: boolean
          confidence_score?: number | null
          created_at?: string
          id?: string
          interpretive_secure?: boolean
          last_practised_at?: string | null
          mastery_status?: string
          needs_review?: boolean
          next_action?: string | null
          quote_pair_id: string
          student_id: string
          updated_at?: string
          used_in_essay_count?: number
          used_in_paragraph_count?: number
          used_in_plan_count?: number
        }
        Update: {
          ao2_secure?: boolean
          ao3_secure?: boolean
          ao4_secure?: boolean
          confidence_score?: number | null
          created_at?: string
          id?: string
          interpretive_secure?: boolean
          last_practised_at?: string | null
          mastery_status?: string
          needs_review?: boolean
          next_action?: string | null
          quote_pair_id?: string
          student_id?: string
          updated_at?: string
          used_in_essay_count?: number
          used_in_paragraph_count?: number
          used_in_plan_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_quote_pair_mastery_quote_pair_id_fkey"
            columns: ["quote_pair_id"]
            isOneToOne: false
            referencedRelation: "quote_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      symbol_entries: {
        Row: {
          created_at: string
          id: string
          level_band: string | null
          linked_methods: string[]
          name: string
          one_line: string
          source_row_key: string | null
          source_text: string
          themes: string[]
          updated_at: string
          use_case: string | null
        }
        Insert: {
          created_at?: string
          id: string
          level_band?: string | null
          linked_methods?: string[]
          name: string
          one_line: string
          source_row_key?: string | null
          source_text: string
          themes?: string[]
          updated_at?: string
          use_case?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          level_band?: string | null
          linked_methods?: string[]
          name?: string
          one_line?: string
          source_row_key?: string | null
          source_text?: string
          themes?: string[]
          updated_at?: string
          use_case?: string | null
        }
        Relationships: []
      }
      themes: {
        Row: {
          ao2: string | null
          ao3: string | null
          ao4: string | null
          at_angle: string
          created_at: string
          ht_angle: string
          id: string
          label: string
          short: string
          sort_order: number | null
          synthesis: string
        }
        Insert: {
          ao2?: string | null
          ao3?: string | null
          ao4?: string | null
          at_angle: string
          created_at?: string
          ht_angle: string
          id: string
          label: string
          short: string
          sort_order?: number | null
          synthesis: string
        }
        Update: {
          ao2?: string | null
          ao3?: string | null
          ao4?: string | null
          at_angle?: string
          created_at?: string
          ht_angle?: string
          id?: string
          label?: string
          short?: string
          sort_order?: number | null
          synthesis?: string
        }
        Relationships: []
      }
      theses: {
        Row: {
          created_at: string
          id: string
          level: string
          paragraph_job_1_label: string
          paragraph_job_2_label: string
          paragraph_job_3_label: string | null
          route_id: string
          theme_family: string
          thesis_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          level: string
          paragraph_job_1_label: string
          paragraph_job_2_label: string
          paragraph_job_3_label?: string | null
          route_id: string
          theme_family: string
          thesis_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          paragraph_job_1_label?: string
          paragraph_job_2_label?: string
          paragraph_job_3_label?: string | null
          route_id?: string
          theme_family?: string
          thesis_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "theses_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      timed_sessions: {
        Row: {
          completed: boolean
          created_at: string
          device_id: string | null
          duration_minutes: number
          ended_at: string | null
          expired: boolean
          id: string
          mode_id: string
          plan_id: string | null
          response_text: string
          started_at: string
          updated_at: string
          user_id: string | null
          word_count: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          device_id?: string | null
          duration_minutes: number
          ended_at?: string | null
          expired?: boolean
          id?: string
          mode_id: string
          plan_id?: string | null
          response_text?: string
          started_at?: string
          updated_at?: string
          user_id?: string | null
          word_count?: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          device_id?: string | null
          duration_minutes?: number
          ended_at?: string | null
          expired?: boolean
          id?: string
          mode_id?: string
          plan_id?: string | null
          response_text?: string
          started_at?: string
          updated_at?: string
          user_id?: string | null
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "timed_sessions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "saved_essay_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      retrieval_due_today: {
        Row: {
          accuracy_pct: number | null
          correct_reviews: number | null
          ease_factor: number | null
          interval_days: number | null
          item_category: string | null
          item_id: string | null
          item_label: string | null
          item_type: string | null
          last_reviewed_at: string | null
          next_review_at: string | null
          repetitions: number | null
          retrieval_item_id: string | null
          source_text: string | null
          total_reviews: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_student_quote_pair_progress: {
        Row: {
          ao2_secure: boolean | null
          ao3_secure: boolean | null
          ao4_secure: boolean | null
          atonement_quote: string | null
          confidence_score: number | null
          hard_times_quote: string | null
          interpretive_secure: boolean | null
          last_practised_at: string | null
          mastery_status: string | null
          needs_review: boolean | null
          quote_pair_code: string | null
          quote_pair_id: string | null
          student_action: string | null
          student_id: string | null
          theme_label: string | null
          updated_at: string | null
          used_in_essay_count: number | null
          used_in_paragraph_count: number | null
          used_in_plan_count: number | null
          why_useful_in_essay: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_quote_pair_mastery_quote_pair_id_fkey"
            columns: ["quote_pair_id"]
            isOneToOne: false
            referencedRelation: "quote_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      v_student_recent_paragraphs: {
        Row: {
          ao1_self_score: number | null
          ao1_sophistication_self_score: number | null
          ao2_self_score: number | null
          ao3_self_score: number | null
          ao4_self_score: number | null
          created_at: string | null
          draft_status: string | null
          final_paragraph: string | null
          id: string | null
          improvement_target: string | null
          quote_pair_code: string | null
          quote_pair_id: string | null
          student_id: string | null
          theme_label: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paragraph_attempts_quote_pair_id_fkey"
            columns: ["quote_pair_id"]
            isOneToOne: false
            referencedRelation: "quote_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_next_best_action: {
        Args: { target_student_id: string }
        Returns: {
          action_type: string
          action_url: string
          priority: number
          quote_pair_code: string
          quote_pair_id: string
          reason: string
          theme_label: string
          title: string
        }[]
      }
      get_user_emails: {
        Args: { _user_ids: string[] }
        Returns: {
          email: string
          user_id: string
        }[]
      }
      has_role:
        | { Args: never; Returns: boolean }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      is_owner:
        | { Args: never; Returns: boolean }
        | {
            Args: { row_device_id: string; row_user_id: string }
            Returns: boolean
          }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
